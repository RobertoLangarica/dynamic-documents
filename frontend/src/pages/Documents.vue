<template>
<div title="Documents" >
  <h1>Documents</h1>
  <q-list bordered separator>
    <q-item v-for="item in this.$store.state.dd.documents" :key="item.id"
            :to="{ name: 'embed-document', params: { id: item.id} }"
            clickable v-ripple>
      <q-item-section>
        <q-item-label>{{ item.name }}</q-item-label>
        <q-item-label caption>{{ item.id }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Documents extends Vue {
  mounted () {
    this.$store.commit('init')
    // TODO remove this override for authorization
    this.$api.setAuthorization(this.$store.state.login.token)
    this.$store.dispatch('getDocuments')
  }
}
</script>
