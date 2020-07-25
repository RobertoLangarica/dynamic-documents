<template>
  <article>
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
    <div v-if="docExists">
      <div v-for="field in currentDoc.fields" :key="field.id" class="field-container">
        <div class="fieldC-controls">
        </div>
        <div class="field-content">
        </div>
      </div>
    </div>
    <q-spinner
      v-else
      color="primary"
      size="3em"
      :thickness="2"
    />
  </article>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'


@Component
export default class Document extends Vue {
  currentView = 'edit'
  currentDoc = null
  views= [
    { label: 'Editar', value: 'edit' },
    { label: 'Capturar', value: 'capture' },
    { label: 'Previsualizar', value: 'view' }
  ]
  get docExists () {
    return !!this.currentDoc
  }
  async mounted () {
    this.currentDoc = await this.$store.dispatch('getDocument', this.$route.params.id)
    console.log('mounted', this.$route.params.id, this.currentDoc)
  }
}
</script>
