import Vue from 'vue'
import Component from 'vue-class-component'
import Transforms from 'src/transformations'

@Component
export default class EmbedMixin extends Vue {
  mounted () {
    // @ts-ignore
    this.$root.invisibleDialogs = true
    this.$root.$on('send_message', this.onSendMessage.bind(this))
    window.addEventListener("message", this.onEventMessageReceived.bind(this), false);
  }

  beforeUnmount () {
    this.$root.$off('send_message')
    window.removeEventListener('message', this.onEventMessageReceived.bind(this))
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
        this.onGlobalMessage(message, data)
        void this.onMessage(message, data)
      }
    }
  }

  async onGlobalMessage (message, data) {
    // Any global message
    switch (message) {
      case 'complete_dialog_action':
      case 'cancel_dialog_action':
        this.$root.$emit(message, data)
        break;
      case 'apply_transforms':
        this.sendMessage('transforms_applied', Transforms.apply(data.transforms, data.value))
        break;
    }
  }

  async onMessage (message:string, data:{[key:string]:any} = {}) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`received => ${message},${data}`)
    // THIS function should have an override
  }

  sendMessage (message:string, data:{[key:string]:any} = {}) {
    let event = JSON.stringify({
      [message]: data
    })

    window.parent.postMessage(event, '*')
  }
}
