<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>
