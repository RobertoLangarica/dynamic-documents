<template>
  <q-dialog ref="dialog" full-height @before-show="onBeforeOpen" @before-hide="onBeforeClose">
    <q-card v-if="!embedded" class="q-dialog-plugin column">
      <q-card-section class="col-auto">
        <span class="text-h6">{{ title }}</span>
      </q-card-section>
      <q-card-section class="col" style="overflow:auto;">
        <field-selector ref="selector" :fields="fields"/>
      </q-card-section>
      <q-card-actions align="right" class="col-auto">
        <q-btn flat color="secondary" label="Cancelar" @click="hide" />
        <q-btn color="primary" label="Aceptar" @click="onAccept" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { QDialog } from 'quasar'
import { DDField } from 'src/dynamic-documents/src/core/DDField'
import FieldSelector from 'src/components/dd/FieldSelector/FieldSelector.vue'

@Component({ components:{ FieldSelector } })
export default class FieldSelectorDialog extends Vue {
    @Prop({ required: false, default: 'Elige un campo' }) readonly title!: string;
    @Prop({ required: true }) readonly fields!:DDField[]

    show () { (this.$refs.dialog as QDialog).show() }
    hide () { (this.$refs.dialog as QDialog).hide() }

    onAccept(){ this.onSelect((this.$refs.selector as any).getSelected()) }

    onSelect (selected) {
      this.$emit('ok', selected)
      this.hide()
    }

    get embedded () {
      // @ts-ignore
      return this.$root.invisibleDialogs
    }

    onBeforeOpen () {
      if (this.embedded) {
        this.$root.$on('complete_dialog_action', this.onSelect)
        this.$root.$on('cancel_dialog_action', this.hide)
        this.$root.$emit('send_message',
          {
            message: 'opening_dialog',
            data: {
              type: 'FieldEmbedDialog',
              title: this.title,
              fields: this.fields
            }
          })
      }
    }

    onBeforeClose () {
      if (this.embedded) {
        this.$root.$off('complete_dialog_action', this.onSelect)
        this.$root.$off('cancel_dialog_action', this.hide)
      }
    }
}
</script>
