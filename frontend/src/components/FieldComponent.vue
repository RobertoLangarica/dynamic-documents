<template>
  <div v-show="isInEditView || (isInCaptureView && field.show_in_capture) || (isInPrintView && field.show_in_print)"
       class="field-container">
    <div class="field-controls q-pt-md" v-if="isInEditView">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="$emit('onShowAddFieldDialog')" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="isInEditView" color="secondary" contenteditable="true">
        {{ field.name }}
      </q-badge>
      <component v-model="field.value"
                 :is="getComponent(field.type, field)"
                 :label="field.label"
                 :hint="field.hint"
                 :readonly="isInPrintView" />
    </div>
    <div class="q-pt-md q-ml-sm field-config" v-if="isInEditView">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DDFieldType, fieldComponentID, fieldComponentUI } from 'src/dynamic-documents/src/core/DDFieldType';

@Component
export default class ClassComponent extends Vue {
  @Prop({ type: Object, required: true }) readonly field!: Object;
  @Prop({ type: Array, required: true }) readonly fields!: Object;
  @Prop({ type: Boolean, required: true }) readonly isInEditView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInCaptureView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInPrintView!: boolean;

  getComponent (fieldType: DDFieldType, field) {
    if (fieldComponentUI[fieldType.component]) {
      let component = fieldComponentUI[fieldType.component].component || 'nq-input'
      console.log('component')
      return component
    } else {
      return 'nq-input'
    }
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
