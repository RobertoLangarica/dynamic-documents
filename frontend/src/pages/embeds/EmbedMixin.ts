import Vue from 'vue'
import Component from 'vue-class-component'
import Transforms from 'src/transformations'
import IDDView from 'src/dynamic-documents/src/core/IDDView'
import { Prop } from 'vue-property-decorator'

@Component
export default class EmbedMixin extends Vue {
@Prop({ required: false, type: String, default: '' }) readonly auth!:string

    doc_ref_identifier:string = 'doc_creation'
    available_views = [
      { label: "Editar", value: IDDView.EDIT },
      { label: "Capturar", value: IDDView.CAPTURE },
      { label: "Previsualizar", value: IDDView.PRINT }]

    authorized:boolean = false
    exists:boolean = true
    ready:boolean = false

    mounted () {
      // This hook is called before the component hook
      if (this.auth) {
        this.$api.setAuthorization(this.auth, '')
      }

      // @ts-ignore
      this.$root.invisibleDialogs = true
      this.$root.$on('send_message', this.onSendMessage.bind(this))
      window.addEventListener("message", this.onEventMessageReceived.bind(this), false);
      if (this.$refs[this.doc_ref_identifier]) {
        this.$refs[this.doc_ref_identifier].$on('mount_ready', this.onDocReady.bind(this))
        this.$refs[this.doc_ref_identifier].$on('loaded_document', this.onDocLoaded.bind(this))
      }
    }

    beforeUnmount () {
    // This hook is called before the component hook
      this.$root.$off('send_message')
      window.removeEventListener('message', this.onEventMessageReceived.bind(this))

      if (this.$refs[this.doc_ref_identifier]) {
        this.$refs[this.doc_ref_identifier].$off('mount_ready')
        this.$refs[this.doc_ref_identifier].$off('loaded_document')
      }
    }

    onSendMessage ({ message, data }) {
      this.sendMessage(message, data || {})
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

    handleMessages (message, data) {
      let handled:boolean = false
      switch (message) {
        case 'complete_dialog_action':
        case 'cancel_dialog_action':
          handled = true
          this.$root.$emit(message, data)
          break;
        case 'apply_transforms':
          handled = true
          this.sendMessage('transforms_applied', Transforms.apply(data.transforms, data.value))
          break;
        case 'get_fields':
          handled = true
          if (this.$refs[this.doc_ref_identifier]) {
            let fields = this.$refs[this.doc_ref_identifier].getFields()
            this.sendMessage('set_fields', fields)
          }
          break;
      }

      void this.onMessage(message, data, handled)
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
      if (!document.status) {
        // It is a template and templates has no status
        return
      }

      let status = document.status.name
      if (status === 'closed' || status === 'prevent_changes') {
        this.available_views = this.available_views.filter(v => v.value === IDDView.PRINT)
      }
    }

    onDocReady () {
      this.$nextTick(() => {
        let el = this.$refs[this.doc_ref_identifier].$el
        this.sendMessage('dd_resize', { width: Math.max(el.scrollWidth, el.offsetWidth), height: Math.max(el.scrollHeight, el.offsetHeight) })
        this.ready = true
      })
    }

    sendMessage (message:string, data:{[key:string]:any} = {}) {
      let event = JSON.stringify({
        [message]: data
      })

      window.parent.postMessage(event, '*')
    }
}
