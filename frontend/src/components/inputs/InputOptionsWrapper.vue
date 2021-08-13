<template>
  <input-options
    v-model="value"
    v-bind="$attrs"
    :edit_view="edit_view"
  >
    <template v-slot:prepend>
      <slot name="prepend" />
    </template>
    <template v-slot:append>
      <slot name="append" />
    </template>
  </input-options>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import InputOptions from './InputOptions.vue'

@Component({ name: 'InputOptionsWrapper', components: { 'input-options': InputOptions } })
export default class InputOptionsWrapper extends Vue {
    @Prop({ required: true }) readonly field!: DDField;
    @Prop({ type: Boolean, required: true }) readonly edit_view!: boolean;

    get value () {
      return this.field.value
    }

    set value (value) {
      this.$emit('input', value)
    }
}
</script>