<template>
  <article class="q-pa-lg">
    <div>
      <q-radio v-for="view in views" v-model="currentView" :val="view.value" :label="view.label" :key="view.value" />
    </div>
    <h1>Doc</h1>
    <div v-if="docExists">
      <draggable v-model="documentFields"
                 @start="drag=true" @end="drag=false"
                 handle=".cursor-drag">
        <div v-for="field in documentFields" :key="field.id" class="field-container">
          <div class="field-controls flex">
            <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="showAddFieldDialog" />
            <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
          </div>
          <div class="field-content">
            {{ field.name }}
          </div>
        </div>
      </draggable>
      <q-btn icon="add" rounded flat size="md" class="cursor-pointer" color="grey" label="Agregar un campo" @click="showAddFieldDialog" />
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
import draggable from 'vuedraggable'
import FieldTypeDialog from 'components/FieldTypeDialog.vue'

@Component({ components: { draggable } })
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
  get documentFields () {
    // TODO: Change this once the store is migrated to TS
    return this.currentDoc.fields
  }
  set documentFields () {
    // this.$store.commit('updateList', value)
  }

  async mounted () {
    await this.$store.dispatch('getDocument', this.$route.params.id)
    await this.$store.dispatch('updateTypes')
    this.currentDoc = this.$store.state.dd.documents[0]
  }

  showAddFieldDialog () {
    this.$q.dialog({
      component: FieldTypeDialog,
      // optional if you want to have access to
      // Router, Vuex store, and so on, in your
      // custom component:
      parent: this, // becomes child of this Vue node
                    // ("this" points to your Vue component)
      // props forwarded to component
      // (everything except "component" and "parent" props above):
      text: 'something',
      // ...more.props...
    }).onOk((type) => {
      console.log('OK', type)
    }).onCancel(() => {
    }).onDismiss(() => {
    })
  }
}
</script>

<style lang="scss">
  .field-container {
    display: flex;
    padding: 0.5em;
    .field-controls {
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
