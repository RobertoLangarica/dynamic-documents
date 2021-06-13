<template>
  <div v-show="show" class="dd-field-container">
    <div class="dd-field-controls q-pt-md" v-if="isInEditView">
      <q-btn
        icon="add"
        flat
        round
        size="md"
        dense
        class="cursor-pointer"
        color="grey"
        @click="showAddFieldDialog"
      />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="dd-field-content">
      <div v-if="isInEditView" class="row justify-between">
        <q-badge color="grey-8 dd-field-name ">
          <template v-if="isInEditView">
            <span contenteditable="true"
                  @input="e=>name=e.target.innerText">{{ initialName }}</span>
            <q-icon name="keyboard" class="q-ml-sm" v-if="field.show_in_capture" />
            <q-icon name="print" class="q-ml-sm" v-if="field.show_in_print" />
          </template>
          <span v-else>{{ initialName }}</span>
        </q-badge>
      </div>
      <btn-autocapture v-if="showGroupAutocapture" :manager="manager" :group_id="field.id" label="Auto capturar grupo" />
      <field-fillmap v-if="showFillmapMapper" :manager="manager" :field_id="field.id" :doc_type="manager.id" />
      <component
        v-model="value"
        :is="getComponent(field.type)"
        :class="`dd-field dd-${field.type.component}`"
        :hint="!isInPrintView ? field.hint : null"
        :label="isInEditView ? field.label : field.label || field.name"
        :readonly="isReadOnly"
        :group="field.id"
        :fields="fields"
        :field="field"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
        :allowAutoCapture="allowAutoCapture"
        :manager="manager"
      />
    </div>
    <div v-if="isInEditView" class="q-ml-sm dd-field-config column items-start justify-start">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" @click="onShowConfigDiaog" />
      <q-btn icon="delete" flat round size="md" dense class="cursor-pointer" color="grey" @click="onDelete" />
    </div>
    <template v-if="isInCaptureView && allowAutoCapture">
      <btn-autocapture :manager="manager" :field_id="field.id" />
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import FieldConfigDialog from "src/components/dd/FieldConfig/FieldConfigDialog.vue";
import draggable from 'vuedraggable'
import FieldTypeSelectionDialog from "./FieldTypeSelection/FieldTypeSelectionDialog.vue";
import FieldFillmap from './Fillmap/FieldFillmap.vue'
import BtnAutocapture from './Fillmap/BtnAutocapture.vue'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";

@Component({ components: { FieldConfigDialog, draggable, FieldFillmap, BtnAutocapture } })
export default class FieldComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ type: Array, required: true }) readonly fields!: DDField[];
  @Prop({ type: Boolean, required: true }) readonly isInEditView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInCaptureView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInPrintView!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) readonly allowAutoCapture!:boolean;
  @Prop({ required: false, default: () => null }) readonly manager!:DocumentEditionManager;
  @Prop({ type: Number, required: false, default: 500 })
  readonly debounce!: number;

  initialName: string = "";
  ignoreNextNameChange: boolean = false
  mounted () {
    this.initialName = this.field.name;
  }

  @Watch('field.name')
  onNameChanged (value, old) {
    if (!this.ignoreNextNameChange) {
      this.initialName = value
    }
    this.ignoreNextNameChange = false
  }

  get showGroupAutocapture(){
    return this.isGroup && this.allowAutoCapture && this.isInCaptureView
  }

  get showFillmapMapper () {
    return !this.isGroup && this.allowAutoCapture && this.isInEditView
  }

  get isGroup () {
    return DDField.isGroup(this.field)
  }

  get show () {
    return this.isInEditView || (this.isInCaptureView && this.field.show_in_capture) || (this.isInPrintView && this.field.show_in_print)
  }

  get isReadOnly () {
    return this.isInPrintView || (this.isInCaptureView && (this.field.readonly || this.block_capture));
  }

  get block_capture () {
    return this.field.type.parameters.block_capture || false
  }

  get name () {
    return this.field.name;
  }

  set name (value) {
    this.field.name = value;
    this.ignoreNextNameChange = true
    this.notifyUpdate({ id: this.field.id, name: value } as DDField); // Sending only the data that changed
  }

  get value () {
    return this.field.value;
  }

  set value (value) {
    this.field.value = value;
    this.notifyUpdate({ id: this.field.id, value: value } as DDField); // Sending only the data that changed
  }

  getComponent (fieldType: DDFieldType) {
    return DDFieldType.getUIComponentName(fieldType)
  }

  onDelete () {
    this.$root.$emit("f-delete", this.field);
  }

  notifyUpdate (field: DDField) {
    this.$root.$emit("f-update", field);
  }

  showAddFieldDialog () {
    this.$q
      .dialog({
        component: FieldTypeSelectionDialog,
        parent: this,
        text: "something"
      })
      .onOk((type) => {
        this.onFieldTypeSelected(type as DDFieldType);
      });
  }

  onShowConfigDiaog () {
    this.$q.dialog({
      component: FieldConfigDialog,
      parent: this,
      field: this.field
    });
  }

  onFieldTypeSelected (type: DDFieldType) {
    let field = DDField.createFromType(type);
    // All the new fields are group brothers
    field.group_by = this.field.group_by;
    this.$root.$emit("f-add_under_sort_index", {
      field: field,
      index: this.field.sort_index
    });
  }

}
</script>

<style lang="scss">

.drop-zone{
    border-radius: 0.25rem;
    background-color: #31CCEC;
}
.drop-zone:empty{
    background-color: transparent;
}

.drop-container{
    border: 1px dotted grey;
    border-radius: 0.25rem;
}

</style>
