import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class EmbedMixin extends Vue {
  mounted () {
    this.$root.$on('opening_dialog', this.onOpeningDialog.bind(this))
    this.$root.$on('closing_dialog', this.onClosingDialog.bind(this))
    window.addEventListener("message", this.onEventMessageReceived.bind(this), false);
  }

  beforeUnmount () {
    this.$root.$off('opening_dialog', this.onOpeningDialog.bind(this))
    this.$root.$off('closing_dialog', this.onClosingDialog.bind(this))
    window.removeEventListener('message', this.onEventMessageReceived.bind(this))
  }

  onOpeningDialog () {
    this.sendMessage('opening_dialog')
  }

  onClosingDialog () {
    this.sendMessage('closing_dialog')
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
        this.onMessage(message, data)
      }
    }
  }

  onMessage (message:string, data:{[key:string]:any} = {}) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`received => ${message},${data}`)
  }

  sendMessage (message:string, data:{[key:string]:any} = {}) {
    let event = JSON.stringify({
      [message]: data
    })

    window.parent.postMessage(event, '*')
  }
}
