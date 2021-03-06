<template>
  <div class="dd-field-group" :class="{'dd-group-has-border':border!=0}">
    <draggable v-model="myFields" handle=".cursor-drag" @end="onDragEnded" :animation="200" class="full-width row">
      <field-component
        v-for="field in myFields"
        :key="field.id"
        :field="field"
        :fields="fields"
        :isInEditView="edit_view"
        :isInCaptureView="capture_view"
        :isInPrintView="print_view"
        :allowAutoCapture="allowAutoCapture"
        :manager="manager"
        @onShowAddFieldDialog="showAddFieldDialog"
      />
    </draggable>
    <q-btn v-if="!readonly && isGroup"
           icon="add"
           rounded
           flat
           size="md"
           class="cursor-pointer add-a-field"
           color="grey"
           :label="isGroup?'Agregar al grupo':'Agregar un elemento'"
           @click="showAddFieldDialog"
    />
    <div />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

import draggable from "vuedraggable";
import FieldComponent from "components/dd/FieldComponent.vue";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";
import FieldTypeSelectionDialog from "./FieldTypeSelection/FieldTypeSelectionDialog.vue";
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";

@Component({ name: 'field-group-component', components: { draggable, FieldTypeSelectionDialog, 'field-component': FieldComponent } })
export default class FieldGroupComponent extends Vue {
@Prop({ required: false, default: '' }) readonly group!:string
@Prop({ required: true }) readonly fields!:DDField[]
@Prop({ required: false, default: false }) readonly edit_view!:boolean ;
@Prop({ required: false, default: false }) readonly capture_view!:boolean ;
@Prop({ required: false, default: false }) readonly print_view!:boolean ;
@Prop({ required: false, default: 0 }) readonly border!:number ;
@Prop({ type: Boolean, required: false, default: true }) readonly allowAutoCapture!:boolean;
@Prop({ required: false, default: () => null }) readonly manager!:DocumentEditionManager ;

get isGroup () {
  return this.group !== ''
}

get myFields () {
  if (this.group === '') {
    // Without group
    return this.fields.filter(v => !v.group_by)
  }

  return this.fields.filter(v => v.group_by === this.group)
}

set myFields (value) { /* Empty on purpose */ }

get readonly () {
  return this.capture_view || this.print_view
}

onDragEnded (e:{oldIndex:number, newIndex:number}) {
  if (e.oldIndex === e.newIndex) return;
  this.$root.$emit('f-sort_field', { field: this.myFields[e.oldIndex], sort_index: this.myFields[e.newIndex].sort_index })
}

showAddFieldDialog () {
  this.$q
    .dialog({
      component: FieldTypeSelectionDialog,
      parent: this,
      text: "something"
    })
    .onOk((type) => {
      this.onFieldTypeSelected(type as DDFieldType)
    });
}

onFieldTypeSelected (type:DDFieldType) {
  let field = DDField.createFromType(type)
  // All the children are part of this group
  field.group_by = this.group
  this.$root.$emit('f-add', field)
}
}
</script>
<style lang="scss">
.dd-edit-view {
  .dd-field-group .dd-field-group {
    background-color: white;
    padding: 0.5em 0.5em 0.5em 0.5em;
    border: 1px dashed grey;
    border-radius: 0.25rem;
  }
}
.dd-group-has-border{
  border: 1px solid grey !important;
  border-radius: 0.25rem;
}

.dd-fields-container {
  .dd-field-container {
    display: flex;
    margin: 0.5em 0;
    position: relative;
    .dd-field-controls {
      display: flex;
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
        // position: absolute;
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
    margin: 0.1em 0px;
    padding: 8px 0px;
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
  .q-field--with-bottom {
    padding-bottom: 0px;
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
  .embeded_container {
    background-color: transparent;
    padding: 0;
    margin: 0;
    line-height: unset;
    border-radius: unset;
    border: unset;
  }
}
</style>
