<template>
  <article class="q-pa-lg">
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
    <div v-if="docExists">
      <div v-for="field in currentDoc.fields" :key="field.id" class="field-container">
        <div class="field-controls flex">
          <q-btn icon="add" flat round size="sm" class="cursor-pointer" />
          <q-btn icon="drag_indicator" flat round size="sm" class="cursor-drag" />
        </div>
        <div class="field-content">
          {{ field.name }}
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
  currentDoc = ''
  views= [
    { label: 'Editar', value: 'edit' },
    { label: 'Capturar', value: 'capture' },
    { label: 'Previsualizar', value: 'view' }
  ]

  get docExists () {
    return !!this.currentDoc
  }

  async mounted () {
    await this.$store.dispatch('getDocument', this.$route.params.id)
    this.currentDoc = this.$store.state.dd.documents[0]
    console.log('mounted', this.$route.params.id, this.currentDoc)
  }
}
</script>

<style lang="scss">
  .field-container {
    display: flex;
    padding: 1em;
    .field-controls {
      color: $muted;
      width: 5em;
      opacity: 0;
      transition: opacity 0.25s;
    }
    .field-content {
      flex: 1
    }
    &:hover, &:active {
      .field-controls {
        opacity: 1;
      }
    }
  }
</style>
