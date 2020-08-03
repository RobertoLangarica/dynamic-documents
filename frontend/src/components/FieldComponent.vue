<template>
  <div>
    <div class="field-controls flex" v-if="currentView === 'edit'">
      <q-btn icon="add" flat round size="md" dense class="cursor-pointer" color="grey" @click="$emit('onShowAddFieldDialog')" />
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <div class="field-content">
      <q-badge v-if="currentView !== 'capture'" color="secondary"> {{ field.name }}</q-badge>
      <q-input v-model="text" label="Standard" outlined :readonly="currentView === 'view'" />
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
