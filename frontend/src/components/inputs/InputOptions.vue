<template>
  <q-field v-bind="$attrs" ref="main">
    <template v-slot:label>
      <div v-if="edit_view" class="full-width row justify-end items-center" :class="{hide:!hovered}" style="pointer-events: auto;">
        <q-btn round flat icon="add" :disable="readonly" @click="addOption" />
        <q-checkbox v-model="isMultipleChoice" label="Permitir selección multiple" />
      </div>
    </template>
    <template v-slot:control>
      <div class="q-pt-md" />
      <div v-for="(option, index) in optionList" :key="option.value">
        <!-- CAPTURE MODE -->
        <template v-if="!edit_view">
          <q-checkbox v-if="isMultipleChoice"
                      class="q-pa-sm"
                      :val="option.value"
                      v-model="selection"
                      :label="option.label"
                      @input="emitUpdate" />
          <!-- single selection -->
          <q-radio v-else
                   class="q-pa-sm"
                   :val="option.value"
                   v-model="selection"
                   :label="option.label"
                   @input="emitUpdate" />
        </template>
        <!-- EDIT MODE -->
        <template v-else>
          <q-input
            v-model="option.label"
            label="Etiqueta"
            borderless
            class="inline-block q-pa-sm"
            @input="emitUpdate"
          >
            <template v-slot:prepend>
              <q-checkbox v-if="isMultipleChoice" :val="option.value" :value="selection" :disable="true" />
              <q-radio v-else :val="option.value" :value="selection" :disable="true" />
            </template>
            <template v-slot:append>
              <q-btn class="icons" round flat icon="delete" size="sm" @click="removeOption(index)" />
            </template>
          </q-input>
        </template>
      </div>
    </template>
  </q-field>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { v4 as uuidv4 } from 'uuid'

@Component({ components: { } })
export default class InputOptions extends Vue {
  @Prop({ type: Boolean, required: false, default: true }) readonly edit_view!: boolean;
  @Prop({ required: false, default: '"{"multipleChoice":false, "options":[]}", "selection":""' }) value!:string; // JSON string
  @Prop({ required: false }) readonly readonly!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) hovered!:boolean;

  optionList:Array<{label, value}> = []
  multipleChoice:boolean = false
  selection:string|string[] = "";

  @Watch('hovered')
  onHovered (value, old) {
    if (!this.$refs.main) {
      return;
    }

    if (value) {
      // @ts-expect-error focus is a method from QField
      this.$refs.main.focus()
    } else {
      // @ts-expect-error blur is a method from QField
      this.$refs.main.blur()
    }
  }

  displayLabel (option) {
    return (this.edit_view) ? '' : option.label
  }

  @Watch('value', { immediate: true })
  onValueChanged (newValue: string) {
    let parsed = newValue ? JSON.parse(newValue) : { multipleChoice: false, options: [], selection: '' };
    this.multipleChoice = parsed.multipleChoice;
    this.optionList = parsed.options;
    this.selection = parsed.selection;
  }

  addOption () {
    this.optionList.push({ label: 'Opción-' + (this.optionList.length + 1).toString(), value: uuidv4() })
    this.emitUpdate()
  }

  removeOption (index) {
    this.optionList.splice(index, 1)
    this.emitUpdate()
  }

  emitUpdate () {
    let newValue = JSON.stringify({ multipleChoice: this.multipleChoice, options: this.optionList, selection: this.selection })
    this.$emit('input', newValue)
  }

  get isMultipleChoice () { return this.multipleChoice }
  set isMultipleChoice (value:boolean) {
    this.multipleChoice = value;

    if (!value) {
      // The selection should be a single ID (string)
      if (Array.isArray(this.selection) && this.selection.length > 0) {
        this.selection = this.selection[0] // we use the first option as the selected one
      }
    } else {
      // The selection should be an array
      this.selection = this.selection ? [this.selection as string] : []
    }

    this.emitUpdate();
  }
}
</script>

<style lang="scss" scoped>
  .hide{
    opacity: 0 !important;
  }
</style>
