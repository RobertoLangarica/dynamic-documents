<template>
  <article>
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
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
  }
}
</script>
