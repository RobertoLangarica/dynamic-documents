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
import moment from 'moment'

@Component({ name: 'InputDateWrapper', components: { 'input-date': InputDate } })
export default class InputDateWrapper extends Vue {
    @Prop({ required: true }) readonly field!: DDField;

    mounted () {
      // Any invalid date gets forced to today
      if (!moment(this.value).isValid()) {
        this.value = new Date().toISOString()
      }
    }

    get value () {
      return this.field.value
    }

    set value (value) {
      this.$emit('input', value)
    }
}
</script>
