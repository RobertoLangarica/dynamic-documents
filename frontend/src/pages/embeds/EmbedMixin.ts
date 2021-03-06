import Vue from 'vue'
import Component from 'vue-class-component'
import IDDView from 'src/dynamic-documents/src/core/IDDView'
import { Prop } from 'vue-property-decorator'

@Component
export default class EmbedMixin extends Vue {
@Prop({ required: false, type: String, default: '' }) readonly download_auth!:string
@Prop({ required: false, type: Boolean, default: false }) readonly need_auth!:boolean
@Prop({ required: false, type: Boolean, default: false }) readonly invisibleDialogs!:boolean
@Prop({ required: false, type: Number, default: 0 }) readonly initialView!:number

    doc_ref_identifier:string = 'doc_creation'
    available_views = [
      { label: "Editar", value: IDDView.EDIT },
      { label: "Capturar", value: IDDView.CAPTURE },
      { label: "Previsualizar", value: IDDView.PRINT }]

    authorized:boolean = false
    authorization:string = ''
    exists:boolean = true
    ready:boolean = false
    docRef_initialized:boolean = false

    get docRef (): Vue {
      return this.$refs[this.doc_ref_identifier] as Vue
    }

    created () {
      // This hook is called before the component hook
      if (!this.need_auth) {
        // No need for authorization
        this.authorized = true
      }

      // If there is an incomming token for download purposes
      if (this.download_auth) {
        this.authorization = this.download_auth;
        this.authorized = true
        this.$api.setAuthorization(this.download_auth, '')
      }

      // @ts-ignore
      this.$root.invisibleDialogs = this.invisibleDialogs
    }

    mounted () {
      // This hook is called before the component hook
      this.$root.$on('send_message', this.onSendMessage)
      window.addEventListener("message", this.onEventMessageReceived, false);

      this.sendMessage('embed_mounted')
    }

    addDocRefListeners () {
      this.$nextTick(() => {
        if (!this.docRef_initialized && !!this.docRef) {
          this.docRef.$on('mount_ready', this.onDocReady)
          this.docRef.$on('loaded_document', this.onDocLoaded)
          // only once
          this.docRef_initialized = true
        }
      })
    }

    beforeDestroy () {
    // This hook is called before the component hook
      this.$root.$off('send_message', this.onSendMessage)
      window.removeEventListener('message', this.onEventMessageReceived)

      if (this.docRef) {
        this.docRef.$off('mount_ready', this.onDocReady)
        this.docRef.$off('loaded_document', this.onDocLoaded)
      }
    }

    onSendMessage ({ message, data }) {
      this.sendMessage(message, data !== undefined ? data : {})
    }

    onEventMessageReceived (event:{[key:string]:any}) {
      if (typeof event?.data === 'string') {
        let message:string = ''
        let data:{[key:string]:any} = {}
        try {
        // Single keyed object that represents the event
          data = JSON.parse(event.data)
          message = Object.keys(data)[0]
          data = data[message]
        } catch (e) {
          // String event
          message = event.data
          data = {}
        } finally {
          this.handleMessages(message, data)
        }
      }
    }

    handleMessages (message, data:{[key:string]:any}) {
      let handled:boolean = false
      switch (message) {
        case 'authorize':
          handled = true
          this.authorization = data.token
          this.$api.setAuthorization(data.token, '');
          this.authorized = true
          this.sendMessage('authorized')
          this.afterAuthorization()
          break;
        case 'complete_dialog_action':
        case 'cancel_dialog_action':
          handled = true
          this.$root.$emit(message, data)
          break;
        case 'get_fields':
          handled = true
          if (this.docRef) {
            let fields = (this.docRef as any).getFields()
            this.sendMessage('set_fields', fields)
          }
          break;
      }

      void this.onMessage(message, data, handled)
    }

    afterAuthorization () {
      // empty for override purposes
    }

    onMessage (message:string, data:{[key:string]:any} = {}, handled = false) {
      if (!handled) {
        console.log(`received => ${message},${data}`)
      }
    }

    onDocLoaded (document) {
      if (!document) {
        this.exists = false
        return;
      }

      this.setAvailableViews(document)
    }

    setAvailableViews (document) {
      let status = document.status.name
      if (status === 'closed' || status === 'prevent_changes') {
        this.available_views = this.available_views.filter(v => v.value === IDDView.PRINT)
      }
    }

    async onDocReady () {
      await this.$nextTick()
      let el = this.docRef.$el
      this.sendMessage('dd_resize', { width: Math.max(el.scrollWidth, (el as any).offsetWidth), height: Math.max(el.scrollHeight, (el as any).offsetHeight) })

      this.ready = true
      await this.$nextTick()
      this.sendMessage('dd_ready')
    }

    sendMessage (message:string, data:{[key:string]:any}|any = {}) {
      let event = JSON.stringify({
        [message]: data
      })
      window.parent.postMessage(event, '*')
    }
}
