<template>
  <input-date v-model="value" v-bind="$attrs">
    <template v-slot:prepend>
      <slot name="prepend" />
    </template>
    <template v-slot:append>
      <slot name="append" />
    </template>
  </input-date>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import InputDate from './InputDate.vue'

@Component({ name: 'InputDateWrapper', components: { 'input-date': InputDate } })
export default class InputDateWrapper extends Vue {
    @Prop({ required: true }) readonly field!: DDField;
    @Prop({ required: false, default: 'es' }) readonly language!: string;

    get value () {
      return this.field.value
    }

    set value (value) {
      this.$emit('input', value)
    }
}
</script>
