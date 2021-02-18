<template>
  <div
    v-show="isInEditView || (isInCaptureView && field.show_in_capture) || (isInPrintView && field.show_in_print)"
    class="dd-field-container"
  >
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
        class="dd-field-name"
        v-if="isInEditView"
        color="grey-8"
      >
        <span contenteditable="true"
              @input="e=>name=e.target.innerText">{{ initialName }}</span>
        <q-icon name="keyboard" class="q-ml-sm" v-if="field.show_in_capture" />
        <q-icon name="print" class="q-ml-sm" v-if="field.show_in_print" />
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

@Component({ components: { FieldConfigDialog } })
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
.dd-fields-container {
  .dd-field-container {
    display: flex;
    margin: 0.5em 0;
    position: relative;
    .dd-field-controls {
      display: flex;
      width: 5em;
      opacity: 0;
      transition: opacity 0.25s;
      justify-content: flex-end;
      align-items: flex-start;
      > button {
        margin-right: -0.25rem;
      }
    }
    .dd-field-config {
      display: flex;
      width: 2em;
      opacity: 0;
      transition: opacity 0.25s;
      align-items: flex-start;
    }
    .dd-field-content {
      flex: 1;
      .dd-field-name {
        position: absolute;
        top: -1rem;
        padding-bottom: 0.5rem;
        border-bottom-left-radius: 0;
      }
      &:hover, &:active {
        .dd-field-name {
        }
      }
      .dd-input-paragraph {
        cursor: text;
        ::selection {
          background-color: $info;
        }
        h1, h2, h3 {
          margin: 1rem auto 0.5rem auto;
          line-height: 1.1;
        }
        h1 {
          font-size: 2rem;
        }
        h2 {
          font-size: 1.5rem;
        }
        h3 {
          font-size: 1.25rem;
        }
      }
    }
    &:hover,
    &:active {
      .dd-field-controls,
      .dd-field-config {
        opacity: 1;
      }
    }
  }
}
.dd-fields-container.dd-edit-view {
  .dd-field-container {
    margin: 1em -1cm 1em -1.75cm;
  }
  .nq-select.q-field--outlined.dd-field .q-field__control,
  .nq-input.q-field--outlined.dd-field .q-field__control,
  .nq-field.q-field--outlined.dd-field .q-field__control {
    background-color: rgba(250, 250, 250, 1);
  }
  .nq-field.q-field--outlined.dd-field.dd-input-paragraph .q-field__control {
    background-color: white;
  }
}
.dd-fields-container.dd-capture-view {
  .nq-field.q-field--outlined.dd-field.dd-input-paragraph .q-field__control {
    background-color: white;
    padding: 0;
    &::before {
      border: none;
    }
    .menubar {
      display: none;
    }
  }
}
.dd-fields-container.dd-print-view {
  .dd-field.q-field--readonly .q-field__control {
    background-color: white;
    &::before {
      border-style: solid;
    }
  }
  .nq-field.q-field--outlined.dd-field .q-field__control {
    background-color: white;
  }
  .nq-field.q-field--outlined.dd-field.dd-input-paragraph .q-field__control {
    background-color: white;
    padding: 0;
    &::before {
      border: none;
    }
    .menubar {
      display: none;
    }
  }
}
</style>
