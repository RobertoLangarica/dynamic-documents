<template>
  <div class="row justify-start add-controls">
    <q-input class="col-12" v-model="text" placeholder="Escribir o" autofocus @blur="onSubmit" @keydown.enter.prevent="onSubmit" />
    <q-btn
      icon="add"
      size="md"
      class="cursor-pointer add-btn q-mt-xs"
      color="grey"
      label="Agregar un elemento"
      @click="showAddFieldDialog"
    />
  </div>
</template>

<script>
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import Vue from 'vue'
import FieldTypeSelectionDialog from "./FieldTypeSelection/FieldTypeSelectionDialog.vue";

export default Vue.extend({
  props: {
    autofocus: { type: Boolean, required: false, default: false }
  },
  data () {
    return {
      text: ''
    }
  },
  computed: {
    paragraph () {
      return this.$store.getters.fieldTypes.find(t => t.name === 'Párrafo')
    }
  },
  methods: {
    showAddFieldDialog () {
      this.$q
        .dialog({
          component: FieldTypeSelectionDialog,
          parent: this
        })
        .onOk((type) => this.onFieldTypeSelected(type));
    },
    onFieldTypeSelected (type) {
      let field = DDField.createFromType(type)
      this.$root.$emit('f-add', field)
    },
    onSubmit () {
      if (!this.text) {
        // No empty fields
        return;
      }

      let field = DDField.createFromType(this.paragraph)
      field.value = this.text
      this.$root.$emit('f-add', field)
      this.text = ''
    }
  }
})
</script>

<style lang="scss" scoped>
.add-btn{
    border-radius: 8px;
}
.add-controls {
  padding: 0 2em
}
</style>
