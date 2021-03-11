<template>
  <q-dialog ref="dialog" @before-show="onBeforeOpen" @before-hide="onBeforeClose" full-height style="width:85vw:">
    <q-card v-if="!invisible" class="column full-width">
      <q-card-section class="col-auto">
        <h5 class="q-my-none">Elige el tipo de campo</h5>
      </q-card-section>
      
      <q-card-section class="col" style="overflow:auto">
        <field-type-selection :categories="fieldTypesCategories" :types="fieldTypes" @selected="onTypeSelected"/>
      </q-card-section>
      <q-card-actions align="center" class="col-auto">
        <q-btn class="full-width" label="Cancelar" @click="hide" flat color="secondary"/>
      </q-card-actions>
    </q-card>
    <span v-else/>
  </q-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QDialog } from "quasar";
import FieldTypeSelection from './FieldTypeSelection.vue'
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";

@Component( { components:{ FieldTypeSelection } } )
export default class FieldTypeSelectionDialog extends Vue {
  isOpen = false
  get open () {
    return this.isOpen
  }

  show () {
    (this.$refs.dialog as QDialog).show();
  }

  hide () {
    (this.$refs.dialog as QDialog).hide();
  }

  onTypeSelected (type: DDFieldType) {
    this.$emit("ok", type);
    this.hide();
  }

  onCancel () {
    this.hide();
  }

  onBeforeOpen () {
    this.isOpen = true
    if (this.invisible) {
      this.$root.$emit('send_message', { message: 'opening_dialog', data: { type: 'FieldTypeDialog', categories: this.$store.getters.fieldTypesCategories, types: this.$store.getters.fieldTypes } })
      this.$root.$on('complete_dialog_action', this.onTypeSelected)
      this.$root.$on('cancel_dialog_action', this.hide)
    }
  }

  onBeforeClose () {
    if (this.invisible) {
      this.$root.$off('complete_dialog_action', this.onTypeSelected)
      this.$root.$off('cancel_dialog_action', this.hide)
    }
  }

  get invisible () {
    // @ts-ignore
    return this.$root.invisibleDialogs
  }

  get fieldTypesCategories () {
    return this.$store.getters.fieldTypesCategories
  }

  get fieldTypes () {
    return this.$store.getters.fieldTypes
  }

}
</script>

<style lang="scss">
.dialog-scroll-list {
  width: 50vw;
  min-width: 240px;
  max-width: 540px;
  height: 70vh;
}

.invisible {
  opacity: 0;
}
</style>
