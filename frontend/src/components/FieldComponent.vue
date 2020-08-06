<template>
  <div v-show="edit_view || (capture_view && field.show_in_capture) || (print_view && field.show_in_print)"
       class="field-container">
    <div class="field-controls q-pt-md" v-if="edit_view">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="$emit('onShowAddFieldDialog')" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="edit_view" color="secondary" contenteditable="true">
        {{ field.name }}
      </q-badge>
      <q-input v-model="field.value" :label="field.label" :hint="field.hint" outlined :readonly="print_view" />
    </div>
    <div class="q-pt-md q-ml-sm field-config" v-if="edit_view">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DDField } from 'src/dynamic-documents/src/core/DDField';

@Component
export default class ClassComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ required: true }) readonly fields!: DDField[];
  @Prop({ required: false, default: true }) readonly edit_view!:boolean ;
  @Prop({ required: false, default: false }) readonly capture_view!:boolean ;
  @Prop({ required: false, default: false }) readonly print_view!:boolean ;

  text = 'Abc'
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
