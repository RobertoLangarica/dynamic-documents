<template>
  <div>
    <br>
    <div v-for="(option, index) in optionList" :key="index" :style="style">
      <q-checkbox v-if="isMultipleChoice" v-model="option.value" :label="option.label" @input="emitUpdate" />
      <q-radio v-else v-model="option.value" :label="option.label" @input="emitUpdate" />
      <template v-if="edit_view">
        <q-input v-model="option.label" label="Etiqueta" borderless class="inline-block" @input="emitUpdate" />
        <q-btn round flat icon="delete" @click="removeOption(index)" />
      </template>
    </div>
    <template v-if="edit_view">
      <q-radio v-model="isMultipleChoice" label="Selección multiple" />
      <q-btn round flat icon="add" :disable="readonly" @click="addOption" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component({ components: { } })
export default class InputOptions extends Vue {
  @Prop({ type: Boolean, required: false, default: true }) readonly edit_view!: boolean;
  @Prop({ required: false, default: '"{"multipleChoice":false, "options":[]}"' }) value!:string; // JSON string
  @Prop({ required: false }) readonly readonly!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) isHorizontal!:boolean;

  optionList:Array<{label, value}> = []
  multipleChoice:boolean = false

  get style () {
    if (this.isHorizontal && !this.edit_view) {
      return 'display:inline;'
    } else if (this.edit_view) {
      return 'display:inline-block;'
    }
    return ''
  }

  displayLabel (option) {
    return (this.edit_view) ? '' : option.label
  }

  @Watch('value', { immediate: true })
  onValueChanged (newValue: string) {
    let parsed = JSON.parse(newValue);
    this.multipleChoice = parsed.multipleChoice;
    this.optionList = parsed.options;
  }

  addOption () {
    this.optionList.push({ label: 'Opción-' + (this.optionList.length + 1).toString(), value: false })
    this.emitUpdate()
  }

  removeOption (index) {
    this.optionList.splice(index, 1)
    this.emitUpdate()
  }

  emitUpdate () {
    let newValue = JSON.stringify({ multipleChoice: this.multipleChoice, options: this.optionList })
    this.$emit('input', newValue)
  }

  get isMultipleChoice () { return this.multipleChoice }
  set isMultipleChoice (value:boolean) {
    this.multipleChoice = value;

    if (!value) {
      // Only one option could be selected
      let selected = true
      this.optionList.forEach(option => {
        if (option.value) {
          option.value = selected;
          selected = false;
        }
      })
    }

    this.emitUpdate();
  }
}
</script>
