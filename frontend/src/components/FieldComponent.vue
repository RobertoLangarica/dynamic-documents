<template>
  <div v-show="currentView === 'edit' || (currentView === 'capture' && field.show_in_capture) || (currentView === 'print' && field.show_in_print)"
       class="field-container">
    <div class="field-controls q-pt-md" v-if="currentView === 'edit'">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="$emit('onShowAddFieldDialog')" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="currentView === 'edit'" color="secondary" contenteditable="true">
        {{ field.name }}
      </q-badge>
      <q-input v-model="field.value" :label="field.label" :hint="field.hint" outlined :readonly="currentView === 'view'" />
    </div>
    <div class="q-pt-md q-ml-sm field-config" v-if="currentView === 'edit'">
      <q-btn icon="settings" flat round size="md" dense class="cursor-pointer" color="grey" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class ClassComponent extends Vue {
  @Prop({ type: Object, required: true }) readonly field!: Object;
  @Prop({ type: Array, required: true }) readonly fields!: Object;
  @Prop({ type: String, required: true }) readonly currentView!: Object;

  text = 'Abc'
}
</script>

<style lang="scss">
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
</style>
