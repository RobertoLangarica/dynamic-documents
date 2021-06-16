<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import api from 'api-client-wrapper'
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {
  beforeMount () { api.baseURL = process.env.API_URL! }
}
</script>
