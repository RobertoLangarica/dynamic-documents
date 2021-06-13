<template>
  <div class="row q-mt-none q-col-gutter-y-md q-pa-md">
    <nq-input v-model="fieldData.name" class="col-12 q-mt-none q-pt-none" label="Nombre del elemento" hint="Para poder identificarlo al editar el documento" />
    <nq-input v-model="fieldData.hint" class="col-12" label="Texto de ayuda" hint="Podrá ser visto por quienes capturen el documento" />
    <nq-input v-model="fieldData.label" class="col-12" label="Etiqueta del campo" hint="Podrá ser visto tanto en captura como en impresión" />

    <!-- Descripción -->
    <nq-input
      v-model="fieldData.description"
      class="col-12"
      label="Descripción interna"
      hint="Una nota para uso interno de quienes creen documentos dinámicos."
      type="textarea"
      style="height: 12em"
    />

    <!-- readonly -->
    <q-item tag="label" v-ripple :disabled="block_capture">
      <q-item-section avatar top>
        <q-checkbox v-model="readonly" :disabled="block_capture" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Campo de sólo lectura</q-item-label>
        <q-item-label caption>
          Un campo de sólo lectura no puede ser editado al momento de capturarse.
        </q-item-label>
      </q-item-section>
    </q-item>

    <!-- Show in capture -->
    <q-item tag="label" v-ripple>
      <q-item-section avatar top>
        <q-checkbox v-model="fieldData.show_in_capture" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Se muestra durante la captura</q-item-label>
        <q-item-label
          caption
        >
          Indica si este campo se debe mostrar durante la fase de captura. Si no se marca la casilla entonces el campo aparece oculto en modo de captura.
        </q-item-label>
      </q-item-section>
    </q-item>

    <!-- Show in print -->
    <q-item tag="label" v-ripple>
      <q-item-section avatar top>
        <q-checkbox v-model="fieldData.show_in_print" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Se muestra durante la vista de impresión</q-item-label>
        <q-item-label
          caption
        >
          Indica si este campo se debe mostrar durante en la vista de impresión. Si no se marca la casilla entonces el campo aparece oculto en la impresión.
        </q-item-label>
      </q-item-section>
    </q-item>

    <!-- Allow capture replication -->
    <q-item tag="label" v-ripple>
      <q-item-section avatar top>
        <q-checkbox v-model="allowReplication" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Se copia durante la captura</q-item-label>
        <q-item-label caption>
          Indica si este campo puede replicarse en modo de captura
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import EmbedMixin from "src/pages/embeds/EmbedMixin";
import {
  DDField
} from "src/dynamic-documents/src/core/DDField";
@Component({})
export default class FieldConfig extends mixins(EmbedMixin) {
    @Prop({ required: false, default: () => Object.assign({}) }) readonly field!: DDField;

    fieldData:DDField = {} as any

    mounted () {
      this.fieldData = Object.assign({}, this.field)
    }

    async onMessage (message, data, handled = false) {
      switch (message) {
        case 'set_data':
          handled = true
          this.fieldData = data
          break;
        case 'get_data':
          handled = true
          this.sendMessage('data_sent', this.getUpdatedData())
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

    get readonly () {
      return this.fieldData.readonly || this.block_capture;
    }

    set readonly (value) {
      if (this.block_capture) {
        // can't change
        return
      }
      this.fieldData.readonly = value;
    }

    get block_capture () {
      return this.fieldData.type ? this.fieldData.type.parameters.block_capture || false : false
    }

    get allowReplication ():boolean {
      return this.fieldData.replication ? this.fieldData.replication.allow : false
    }

    set allowReplication (value:boolean) {
      this.fieldData.replication = Object.assign({}, this.fieldData.replication ? this.fieldData.replication : {}, { allow: value } as any)
      this.fieldData = Object.assign({}, this.fieldData)
    }

    getUpdatedData () {
      return this.fieldData
    }
}
</script>
