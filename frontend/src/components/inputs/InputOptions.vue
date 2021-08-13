<template>
  <div>
    <br>
    <div v-for="(option, index) in optionList" :key="index" :style="style">
      <q-radio v-model="optionValue" :label="displayLabel(option)" :val="option.value" id="option" />
      <q-input v-if="edit_view" v-model="option.label" label="Etiqueta" borderless class="inline-block"></q-input>
      <q-input v-if="edit_view" v-model="option.value" label="Valor" borderless class="inline-block"></q-input>
      <q-btn  v-if="edit_view" round flat icon="delete" @click="removeOption(index)" />
    </div>
    <q-btn v-if="edit_view" round flat icon="add" :disable="readonly" @click="addOption"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import numeral from 'numeral'

@Component({ components: { } })
export default class InputOptions extends Vue {
  @Prop({ type: Boolean, required: false, default:true }) readonly edit_view!: boolean;
  @Prop({ required: false, default: 0 }) value!:number|string
  @Prop({ required: false, default: ()=>[] }) options!:Array<{label,value}>
  @Prop({ required: false }) readonly readonly!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) isHorizontal!:boolean;

  focused:boolean = false
  optionValue:string|number = 0
  optionList:Array<{label,value}> = []
  lastValue: number = 0
  
  get style(){
    if(this.isHorizontal && !this.edit_view){
      return 'display:inline;'
    } else if(this.edit_view) {
      return 'display:inline-block;'
    }
    return ''
  }
  displayLabel(option) {
    return (this.edit_view)?'':option.label
  }

  created () {
    this.optionValue = this.value
  }

  onBlur () {
    this.focused = false
  }

  valueNumber (value: number|string) {
    return numeral(value).value()
  }

  onFocus () {
    this.focused = true
  }

  @Watch('value')
  onValueChanged (newValue: number|string) {
    if (!this.focused) {
    }
  }

  addOption(){
    value:this.lastValue++
    this.optionList.push({label:'etiqueta '+this.lastValue,value:this.lastValue})
  }
  removeOption(index) {
    this.optionList.splice(index,1)
  }
}
</script>