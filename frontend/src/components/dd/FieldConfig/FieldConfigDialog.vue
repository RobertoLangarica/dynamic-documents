<template>
  <q-dialog ref="fc_dialog" @before-show="onBeforeOpen" @before-hide="onBeforeClose" full-height>
    <q-card v-if="!embedded" class="column full-width">
      <q-card-section class="col-auto">
        <h5 class="q-my-none">Propiedades del campo</h5>
      </q-card-section>
      <q-card-section class="col q-pa-none" style="overflow:auto;">
        <field-config ref="config" :field="field" />
      </q-card-section>
      <q-card-actions align="center" class="col-auto">
        <q-btn class="full-width" color="secondary" label="Aceptar" @click="onSaveAndClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QDialog } from "quasar";
import { Prop } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import FieldConfig from "./FieldConfig.vue"

@Component({ components: { FieldConfig } })
export default class FieldConfigDialog extends Vue {
  @Prop({ required: true }) readonly field!: DDField;

  show () {
    (this.$refs.fc_dialog as QDialog).show();
  }

  hide () {
    (this.$refs.fc_dialog as QDialog).hide();
  }

  get embedded () {
    // @ts-ignore
    return this.$root.invisibleDialogs
  }

  onDataUpdated (data) {
    // filter only those properties with real changes
    let keys = Object.keys(data)
    let toUpdate:{[key:string]:any} = {}
    keys.forEach(key => {
      if (data[key] !== this.field[key]) {
        toUpdate[key] = data[key]
        this.field[key] = toUpdate[key]
      }
    })

    if (Object.keys(toUpdate).length > 0) {
      // Something to update
      toUpdate.id = this.field.id
      this.notifyUpdate(toUpdate);
    }
    this.hide()
  }

  onBeforeOpen () {
    if (this.embedded) {
      this.$root.$on('complete_dialog_action', this.onDataUpdated)
      this.$root.$on('cancel_dialog_action', this.hide)
      this.$root.$emit('send_message',
        {
          message: 'opening_dialog',
          data: {
            type: 'FieldConfigDialog',
            field: this.field
          }
        })
    }
  }

  onSaveAndClose () {
    this.onDataUpdated((this.$refs.config as any).getUpdatedData())
    this.hide()
  }

  onBeforeClose () {
    if (this.embedded) {
      this.$root.$off('complete_dialog_action', this.onDataUpdated)
      this.$root.$off('cancel_dialog_action', this.hide)
    }
  }

  notifyUpdate (field) {
    this.$root.$emit("f-update", field);
  }
}
</script>
