import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class EmbedMixin extends Vue {
  mounted () {
    window.addEventListener("message", this.onEventMessageReceived.bind(this), false);
  }

  beforeUnmount () {
    window.removeEventListener('message', this.onEventMessageReceived.bind(this))
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMessage (message:string, data:{[key:string]:any} = {}) {
    console.log(`received => ${message}`)
  }

  sendMessage (message:string, data:{[key:string]:any} = {}) {
    let event = JSON.stringify({
      [message]: data
    })

    console.log(`sending => ${event}`)
  }
}
