<template>
  <article>
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
    <div v-if="exists">
      <div v-for="field in currentDoc.fields" :key="field.id">
        {{field.name}}
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

<script>
let VIEW_EDIT = 'edit'
let VIEW_CAPTURE = 'capture'
let VIEW_PREVIEW = 'preview'
export default {
  name: 'PageIndex',
  data () {
    return {
      views: [
        { label: 'Editar', value: VIEW_EDIT },
        { label: 'Capturar', value: VIEW_CAPTURE },
        { label: 'Previsualizar', value: VIEW_PREVIEW }
      ],
      currentView: VIEW_EDIT,
      currentDoc: null
    }
  },
  computed: {
    exists () {
      return !!this.currentDoc
    }
  },
  async mounted () {
    this.currentDoc = await this.$store.dispatch('getDocument', this.$route.params.id)
  }
}
</script>
