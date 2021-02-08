<template>
  <q-dialog ref="fc_dialog" @before-show="onBeforeOpen" @before-hide="onBeforeClose">
    <q-card>
      <q-card-section>
        <div class="row q-mt-none q-col-gutter-y-md">
          <nq-input v-model="name" class="col-12 q-mt-none q-pt-none" label="Nombre del elemento" hint="Para poder identificarlo al editar el documento" :debounce="debounce" />

          <nq-input v-model="hint" class="col-12" label="Texto de ayuda" hint="Podrá ser visto por quienes capturen el documento" :debounce="debounce" />

          <nq-input v-model="label" class="col-12" label="Etiqueta del campo" hint="Podrá ser visto tanto en captura como en impresión" :debounce="debounce" />

          <!-- Descripción -->
          <nq-input
            v-model="description"
            class="col-12"
            label="Descripción interna"
            hint="Una nota para uso interno de quienes creen documentos dinámicos."
            :debounce="debounce"
            type="textarea"
            style="height: 12em"
          />

          <!-- readonly -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="readonly" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Campo de sólo lectura</q-item-label>
              <q-item-label
                caption
              >
                Un campo de sólo lectura no puede ser editado al momento de capturarse.
              </q-item-label>
            </q-item-section>
          </q-item>

          <!-- required -->
          <!-- <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="required" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Requerido</q-item-label>
              <q-item-label caption>
                Cuando un campo es requerido, el documento no se encuentra completamente capturado hasta que se ingrese un valor a este campo.
              </q-item-label>
            </q-item-section>
          </q-item>-->

          <!-- replication -->
          <!-- <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="replication" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Se puede replicar</q-item-label>
              <q-item-label caption>
                Cuando un campo se puede "replicar", en modo de captura se puede clonar este acmpo las veces que se quiera.
              </q-item-label>
            </q-item-section>
          </q-item>-->

          <!-- Show in capture -->
          <q-item tag="label" v-ripple>
            <q-item-section avatar top>
              <q-checkbox v-model="show_in_capture" />
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
              <q-checkbox v-model="show_in_print" />
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
        </div>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat rounded color="secondary" label="Cerrar" @click="onClose" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { QDialog } from "quasar";
import { Prop } from "vue-property-decorator";
import {
  DDField,
  FDataReplication
} from "src/dynamic-documents/src/core/DDField";
@Component({})
export default class FieldConfigDialog extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ required: false, default: 500 }) readonly debounce!: number;
  allowReplication: boolean = false;

  mounted () {
    this.allowReplication = !this.field.replication
      ? false
      : this.field.replication.allow;
  }

  show () {
    (this.$refs.fc_dialog as QDialog).show();
  }

  hide () {
    (this.$refs.fc_dialog as QDialog).hide();
  }

  onClose () {
    this.hide();
  }

  onBeforeOpen () {
    this.$root.$emit('send_message', { message: 'opening_dialog' })
  }

  onBeforeClose () {
    /***/
  }

  get config_properties () {
    let result: any[] = [];

    // Description
    result.push({
      value: "menu_description",
      component: "nq-input",
      props: {
        label: "Descripción para menú",
        clearable: true,
        "stack-label": true
      }
    });

    return result;
  }

  get description () {
    return this.field.description;
  }

  set description (value) {
    this.field.description = value;
    this.notifyUpdate({ id: this.field.id, description: value });
  }

  get name () {
    return this.field.name;
  }

  set name (value) {
    this.field.name = value;
    this.notifyUpdate({ id: this.field.id, name: value });
  }

  get readonly () {
    return this.field.readonly;
  }

  set readonly (value) {
    this.field.readonly = value;
    this.notifyUpdate({ id: this.field.id, readonly: value });
  }

  get required () {
    return this.field.required;
  }

  set required (value) {
    this.field.required = value;
    this.notifyUpdate({ id: this.field.id, required: value });
  }

  get replication (): boolean {
    return this.allowReplication;
  }

  set replication (value: boolean) {
    if (!this.field.replication) {
      this.field.replication = new FDataReplication();
    }
    this.field.replication.allow = value;
    this.allowReplication = value;
    this.notifyUpdate({
      id: this.field.id,
      replication: this.field.replication
    });
  }

  get show_in_capture () {
    return this.field.show_in_capture;
  }

  set show_in_capture (value) {
    this.field.show_in_capture = value;
    this.notifyUpdate({ id: this.field.id, show_in_capture: value });
  }

  get show_in_print () {
    return this.field.show_in_print;
  }

  set show_in_print (value) {
    this.field.show_in_print = value;
    this.notifyUpdate({ id: this.field.id, show_in_print: value });
  }

  get hint () {
    return this.field.hint;
  }

  set hint (value) {
    this.field.hint = value;
    this.notifyUpdate({ id: this.field.id, hint: value });
  }

  get label () {
    return this.field.label;
  }

  set label (value) {
    this.field.label = value;
    this.notifyUpdate({ id: this.field.id, label: value });
  }

  notifyUpdate (field) {
    this.$root.$emit("f-update", field);
  }
}
</script>
