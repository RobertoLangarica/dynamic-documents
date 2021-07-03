<template>
  <input-date v-model="value" v-bind="$attrs">
    <template v-slot:prepend>
      <slot name="prepend" />
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

    get value () {
      return this.field.value
    }

    set value (value) {
      this.$emit('input', value)
    }
}
</script>
