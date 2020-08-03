<template>
    <div class="row q-col-gutter-y-sm">
    <div class="col-12 row items-center justify-between">
        <h3>{{name}}</h3>
        <div >
          <q-btn v-if="editMode" round icon="delete" color="negative" flat @click="deleted()"/>
          <q-btn round :icon="!editMode ? 'edit':'close'" color="primary" flat @click="editMode=!editMode"/>
        </div>
    </div>

    <!-- EDITION MODE -->
    <template v-if="editMode" >
      <!-- READONLY -->
      <q-checkbox v-model="readonly" label="Este campo se puede editar al momento de capturar" />

      <!-- NAME -->
      <q-expansion-item label="Nombre del campo" class="col-12" icon="person_search">
        <nq-input  v-model="name" dense label="Nombre" :debounce="debounce"/>
      </q-expansion-item>

      <!-- DESCRIPTION -->
      <q-expansion-item label="Descripción del campo" class="col-12" icon="person_search">
        <nq-input  v-model="description" label="Descripción" type="textarea" :debounce="debounce"/>
      </q-expansion-item>

      <!-- SHOW IN PRINT/CAPTURE -->
      <q-expansion-item label="Vista e impresión" class="col-12" icon="preview">
        <div class="row justify-between">
          <q-checkbox v-model="show_in_print" left-label label="Visible en modo de captura" />
          <q-checkbox v-model="show_in_capture" left-label label="Visible en modo de impresión" />
        </div>
      </q-expansion-item>

      <!-- VALUE -->
      <q-expansion-item label="Valor y captura" class="col-12" icon="preview">
        <div class="col-12 row q-col-gutter-y-md">
        <span class="text-h6">Vista al capturar</span>
        <component
          class="col-12"
          v-bind="field.type.parameters ? field.type.parameters : {}"
          :is="component_name"
          :field="field"
          :all_fields="all_fields"
          :hint="(field.hint && field.hint !== '') ? field.hint :field.type.description"
          :label="field.label && field.label !== '' ? field.label:'Etiqueta'"
          :debounce="debounce"
          v-model="value"
          @f-added="added"
          @f-updated="updated"
          @f-deleted="deleted"
          />

          <!-- Label & Hint -->
          <q-expansion-item label="Configuración de la captura" class="col-12">
            <div class="col-12 row justify-between">
              <nq-input  class="col-5" v-model="label" dense size="xs" label="Label" :debounce="debounce"/>
              <nq-input  class="col-5" v-model="hint" dense size="xs" label="Hint" :debounce="debounce"/>
              <q-checkbox v-model="required" left-label label="Campo forzosamente requerido" />
            </div>
          </q-expansion-item>
        </div>

      </q-expansion-item>
    </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import { DDField } from '../src/core/DDField'

@Component({name:'basic-field'})
export default class BasicField extends Vue {
  @Prop({default: ()=> new DDField(), required:false }) readonly field!:DDField
  @Prop({default: ()=> [], required:false }) readonly all_fields!:DDField[]

  /** PROPERTIES */
  editMode:boolean = false
  debounce:number = 600
  /**************/

  mounted(){
    if (this.field.initInEdition) {
      this.editMode = true
    }
  }

  updated (field?:DDField) {
    this.$emit('f-updated', field || this.field)
  }

  deleted (field?:DDField) {
    this.$emit('f-deleted', field || this.field)
  }

  added (field:DDField) {
    this.$emit('f-added', field)
  }

  get name() {
    return this.field.name
  }
  set name(value) {
    this.field.name = value
    this.updated()
  }

  get value () {
    return this.field.value
  }
  set value (value) {
    this.field.value = value
    this.updated()
  }


  get label () {
    return this.field.label
  }
  set label (value) {
    this.field.label = value
    this.updated()
  }


  get hint () {
    return this.field.hint
  }
  set hint (value) {
    this.field.hint = value
    this.updated()
  }


  get description () {
    return this.field.description
  }
  set description (value) {
    this.field.description = value
    this.updated()
  }


  get readonly () {
    return this.field.readonly
  }
  set readonly (value) {
    this.field.readonly = value
    this.updated()
  }

  get show_in_print () {
    return this.field.show_in_print
  }
  set show_in_print (value) {
    this.field.show_in_print = value
    this.updated()
  }


  get show_in_capture () {
    return this.field.show_in_capture
  }
  set show_in_capture (value) {
    this.field.show_in_capture = value
    this.updated()
  }


  get required () { return this.field.required }
  set required (value) {
    this.field.required = value
    this.updated()
  }


  get type () {
    return this.field.type.name
  }
  
  get component_name () {
    return this.field.type.component
  }

}
</script>
