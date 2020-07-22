<template>
  <article>
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
    <div v-if="$store.state.dd.document">
      <div v-for="field in $store.state.dd.document.fields" :key="field.id">
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
      currentView: VIEW_EDIT
    }
  },
  async mounted () {
    await this.$store.dispatch('getDocument', this.$route.params.id)
  }
}
</script>
