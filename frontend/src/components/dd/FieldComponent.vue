<template>
  <div v-show="show" class="dd-field-container" >
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
      <q-badge
        v-if="isInEditView"
        class="dd-field-name"
        color="grey-8"
      >
        <template v-if="isInEditView">
          <span contenteditable="true"
              @input="e=>name=e.target.innerText">{{ initialName }}</span>
          <q-icon name="keyboard" class="q-ml-sm" v-if="field.show_in_capture" />
          <q-icon name="print" class="q-ml-sm" v-if="field.show_in_print" />
        </template>
        <span v-else>{{ initialName }}</span>
      </q-badge>
      <component
        v-model="value"
        :is="getComponent(field.type)"
        :class="`dd-field dd-${field.type.component}`"
        :label="field.label"
        :hint="!isInPrintView ? field.hint : null"
        :readonly="isReadOnly"
        :group="field.id"
        :fields="fields"
        :field="field"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
      />
    </div>
    <div class="q-ml-sm dd-field-config column items-start justify-start" v-if="isInEditView">
      <q-btn
        icon="settings"
        flat
        round
        size="md"
        dense
        class="cursor-pointer"
        color="grey"
        @click="onShowConfigDiaog"
      />
      <q-btn
        icon="delete"
        flat
        round
        size="md"
        dense
        class="cursor-pointer"
        color="grey"
        @click="onDelete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import {
  DDFieldType,
  FieldComponentUI
} from "src/dynamic-documents/src/core/DDFieldType";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import FieldTypeDialog from "components/FieldTypeDialog.vue";
import FieldConfigDialog from "components/dd/FieldConfigDialog.vue";
import draggable from 'vuedraggable'

@Component({ components: { FieldConfigDialog, draggable } })
export default class FieldComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ type: Array, required: true }) readonly fields!: DDField[];
  @Prop({ type: Boolean, required: true }) readonly isInEditView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInCaptureView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInPrintView!: boolean;
  @Prop({ type: Number, required: false, default: 500 })
  readonly debounce!: number;

  initialName: string = "";

  mounted () {
    this.initialName = this.field.name;
  }

  get show(){
    return this.isInEditView || (this.isInCaptureView && this.field.show_in_capture) || (this.isInPrintView && this.field.show_in_print)
  }

  get isReadOnly () {
    return this.isInPrintView || (this.isInCaptureView && this.field.readonly);
  }

  get name () {
    return this.field.name;
  }

  set name (value) {
    this.field.name = value;
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
    if (FieldComponentUI[fieldType.component]) {
      let component =
        FieldComponentUI[fieldType.component].component || "nq-input";
      return component;
    } else {
      return "nq-input";
    }
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
        component: FieldTypeDialog,
        parent: this,
        text: "something"
      })
      .onOk((type) => {
        this.onFieldTypeSelected(type as DDFieldType);
      });
  }

  onShowConfigDiaog () {
    this.$q.dialog({
      maximized: true,
      fullWidth: true,
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
