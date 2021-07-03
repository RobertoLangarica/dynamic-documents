<template>
  <q-input v-model="formattedValue"
           @focus="onFocus"
           @blur="onBlur"
           v-bind="$attrs"
           :outlined="!filled && !standout && !borderless"
           class="nq-input nq-component nq-input-number"
           :dense="size==='sm' || size==='xs' || $attrs.dense"
           :input-class="`nq-input-field ${$attrs['input-class'] || ''} size-${size} text-${align}`"
  >
    <template v-slot:prepend>
      <slot name="prepend" />
    </template>
  </q-input>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import numeral from 'numeral'
@Component({ components: { } })
export default class InputNumber extends Vue {
  @Prop({ required: false, default: 0 }) value!:number|string
  @Prop({ required: false, default: '0,0' }) pattern!:string
  @Prop({ required: false, default: '' }) prefix!:string
  @Prop({ required: false, default: '' }) suffix!:string
  @Prop({}) filled!:boolean
  @Prop({}) standout!:boolean
  @Prop({}) borderless!:boolean
  @Prop({ type: String, default: 'md' }) size!:string
  @Prop({ type: String, default: 'right' }) align!:string

  focused:boolean = false
  formattedValue:string|number = 0

  created () {
    this.formattedValue = this.format(this.value)
  }

  onBlur () {
    this.focused = false
    this.formattedValue = this.format(this.formattedValue)
    let numericValue = this.valueNumber(this.formattedValue)
    this.$emit('input', numericValue)
  }

  format (value: number|string) {
    return this.prefix + this.formattedNumber(value) + this.suffix
  }

  formattedNumber (value: number|string) {
    return numeral(value).format(this.pattern)
  }

  valueNumber (value: number|string) {
    return numeral(value).value()
  }

  onFocus () {
    this.focused = true
    this.formattedValue = this.format(this.value)
    // this.formattedValue = this.formattedNumber(this.value)
    // this.formattedValue = this.valueNumber(this.value)
  }

  @Watch('value')
  onValueChanged (newValue: number|string) {
    if (!this.focused) {
      this.formattedValue = this.format(newValue)
    }
  }
}
</script>
