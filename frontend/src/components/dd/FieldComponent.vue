<template>
  <div v-show="isInEditView || (isInCaptureView && field.show_in_capture) || (isInPrintView && field.show_in_print)" class="field-container">
    <div class="field-controls q-pt-md" v-if="isInEditView">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="showAddFieldDialog" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="isInEditView" color="secondary" contenteditable="true" @input="e=>name=e.target.innerText" >
        {{ name }}
      </q-badge>
      <component v-model="value"
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
    <div class="q-pt-md q-ml-sm field-config column justify-start" v-if="isInEditView">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" @click="onShowConfigDiaog"/>
      <q-btn icon="delete" flat round size="md" dense class="cursor-pointer" color="grey" @click="onDelete"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DDFieldType, FieldComponentUI } from 'src/dynamic-documents/src/core/DDFieldType';
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import FieldTypeDialog from "components/FieldTypeDialog.vue";
import FieldConfigDialog from 'components/dd/FieldConfigDialog.vue'
import {throttle} from 'underscore/modules/index'

@Component({components:{FieldConfigDialog}})
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
    this.notifyUpdate({id:this.field.id,name:value}) // Sending only the data that changed
  }

  get value(){return this.field.value }
  set value(value){
    this.field.value = value
    this.notifyUpdate({id:this.field.id,value:value}) // Sending only the data that changed
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
  notifyUpdate = throttle( (field)=> {
    this.$root.$emit('f-update', field)
  }, this.debounce, {leading:false})
  
  showAddFieldDialog () {
    this.$q
      .dialog({
        component: FieldTypeDialog,
        parent: this,
        text: "something"
      })
      .onOk((type) => {
        this.onFieldTypeSelected(type as DDFieldType)
      });
  }

  onShowConfigDiaog(){
    this.$q.dialog({
      maximized:true,
      fullWidth:true,
      component: FieldConfigDialog,
      parent: this,
      field:this.field
    })
  }

  onFieldTypeSelected (type:DDFieldType) {
    let field = DDField.createFromType(type)
    // All the new fields are group brothers
    field.group_by = this.field.group_by
    this.$root.$emit('f-add_under_sort_index', {field:field, index:this.field.sort_index})
  }
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
