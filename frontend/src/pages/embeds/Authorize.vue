<template />

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'

import EmbedMixin from './EmbedMixin'

@Component({})
export default class Authorize extends mixins(EmbedMixin) {
  handleMessages (message, data) {
    // This override prevents any handling from the mixin
    switch (message) {
      case 'authorize':
        /*
            Adding this token as authorization.
            This token should not be stored in the Vuex.store nor LocalStorage
        */
        this.$api.setAuthorization(data.token, '');
        void this.$router.replace({ name: data.location, params: data.params, query: { auth: data.token } })

        // Preventing Authorize from reacting to send_message events
        // TODO review is there is a way to provoke an Authorization unmount instead of this
        this.$root.$off('send_message')
        break;
      default:
    }
  }
}
</script>
