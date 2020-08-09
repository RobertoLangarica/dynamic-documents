<template>
  <div v-show="isInEditView || (isInCaptureView && field.show_in_capture) || (isInPrintView && field.show_in_print)"
       class="field-container">
    <div class="field-controls q-pt-md" v-if="isInEditView">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="$emit('onShowAddFieldDialog')" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="isInEditView" color="secondary" contenteditable="true" @input="e=>name= e.target.outerText" >
        {{ name }}
      </q-badge>
      <q-badge v-if="isInEditView" color="secondary" >
        {{ field.sort_index }}
      </q-badge>
      <component v-model="field.value"
                :is="getComponent(field.type)"
                :label="field.label"
                :hint="field.hint"
                :readonly="isInPrintView" 
                :group="field.id"
                :fields="fields"
                :edit_view="isInEditView"
                :capture_view="isInCaptureView"
                :print_view="isInPrintView"
                 />
    </div>
    <div class="q-pt-md q-ml-sm field-config column" v-if="isInEditView">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" />
      <q-btn icon="delete" flat round size="md" dense class="cursor-pointer" color="red" @click="onDelete"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DDFieldType, FieldComponentUI } from 'src/dynamic-documents/src/core/DDFieldType';
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import {throttle} from 'underscore/modules/index'

@Component
export default class ClassComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ type: Array, required: true }) readonly fields!: DDField[];
  @Prop({ type: Boolean, required: true }) readonly isInEditView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInCaptureView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInPrintView!: boolean;
  @Prop({ type: Number, required: false, default:500 }) readonly debounce!: number;

  get name(){return this.field.name }
  set name(value){
    this.field.name = value
    this.notifyUpdate()
  }

  getComponent (fieldType: DDFieldType, field:DDField) {
    if (FieldComponentUI[fieldType.component]) {
      let component = FieldComponentUI[fieldType.component].component || 'nq-input'
      return component
    } else {
      return 'nq-input'
    }
  }

  onDelete(){
    this.$root.$emit('f-delete', this.field)
  }

  // Avoiding overflow of update calls
  notifyUpdate = throttle( ()=> {
    this.$root.$emit('f-update', this.field)
  }, this.debounce, {leading:false})
  
}
</script>

<style lang="scss">
  .fields-container {
    &.edit {
      .field-container {
        margin: 0.5em 0;
        &:hover {
          background-color: #f8f8f8;
        }
      }
    }
    .field-container {
      display: flex;
      padding: 0.5em;
      .field-controls {
        display: flex;
        width: 5em;
        opacity: 0;
        transition: opacity 0.25s;
        justify-content: flex-end;
        align-items: flex-start;
      }
      .field-config {
        display: flex;
        width: 2em;
        opacity: 0;
        transition: opacity 0.25s;
        justify-content: flex-end;
        align-items: flex-start;
      }
      .field-content {
        flex: 1
      }
      &:hover, &:active {
        .field-controls, .field-config {
          opacity: 1;
        }
      }
    }
  }
</style>
