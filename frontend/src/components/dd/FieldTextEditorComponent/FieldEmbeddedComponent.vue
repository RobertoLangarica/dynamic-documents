<template>
  <div class="embeded_container row items-center" :class="{'selected':selected}">
    <!-- EDIT MODE -->
    <template v-if="!readonly">
      <q-btn icon="drag_indicator" flat round size="sm" dense class="cursor-drag hide-selection" color="grey" />
      <span class="cursor-drag inline-block component-name">&nbsp;{{ name }}&nbsp;</span>
      <q-btn icon="settings" flat round size="sm" dense class="cursor-pointer hide-selection" color="grey" @click="onSettings" />
    </template>
    <template v-else>
      <span v-if="!isParagraph">{{ transformedValue }}</span>
      <editor-content v-else :editor="editor" :readonly="true" :fields="fields" />
    </template>
    <transformations-dialog v-model="showTransforms" :field_value="value" @ok="onSaveTransformations" :initial_transformations="transformations.split(',')" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { EFieldComponentID } from "src/dynamic-documents/src/core/DDFieldType";
import { Editor, EditorContent, Node } from "tiptap";
import {
  BulletList,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Italic,
  Strike,
  Underline,
  History
} from "tiptap-extensions";
import FieldEmbeded from "./FieldEmbedded";
import Transforms from 'src/transformations'

import TransformationsDialog from "src/components/dd/Transformations/TransformationsDialog.vue";

@Component({
  components: {
    "editor-content": EditorContent,
    'transformations-dialog': TransformationsDialog
  }
})
export default class FieldEmbeddedComponent extends Vue {
  @Prop({ required: false }) readonly node!: Node;
  @Prop({ required: false }) readonly updateAttrs!: (any) => any;
  @Prop({ required: false }) readonly view;

  showTransforms = false
  editor: Editor = {};
  selected:boolean = false

  @Watch('view.state.selection')
  onSelectionChange (value, old) {
    if (!value.empty) {
      this.selected = this.isSelected(value.content())
    } else {
      this.selected = false
    }
  }

  isSelected = (slice) => {
    const containsMe = (node) => {
      if (!node.type) {
        // Not a Node
        return false
      }

      if (node.type.name === 'field_embedded') {
        if (node.attrs.field_id === this.field_id) {
          return true
        }
      }
      // continue searching on the Fragment
      for (let i = 0; i < node.content.content.length; i++) {
        if (containsMe(node.content.content[i])) {
          return true
        }
      }
      return false
    }

    for (let i = 0; i < slice.content.content.length; i++) {
      if (containsMe(slice.content.content[i])) {
        return true
      }
    }

    return false
  }

  get field_id (): string {
    return this.node.attrs.field_id;
  }

  set field_id (value) {
    this.updateAttrs({ field_id: value });
  }

  get transformations (): string {
    return this.node.attrs.transformations || '';
  }

  set transformations (value) {
    this.updateAttrs({ transformations: value });
  }

  get name (): string {
    return this.field ? this.field.name : "";
  }

  get value () {
    if (this.field) {
      this.editor.setContent(this.field.value);
    }
    return this.field ? this.field.value : "";
  }

  get transformedValue () {
    let appliedTransforms = this.transformations.split(',').map(name=>{
      let splitted = name.split(':')
      let transform = this.$store.getters.transformation(splitted[0])

      if(splitted.length > 1){
        // Override input
        let parameters =  { input:splitted[1] }
        parameters = Object.assign({},transform.parameters,parameters)
        Object.assign(transform,{ parameters:parameters })
      }

      return transform
    })
    return Transforms.apply(appliedTransforms, this.value)
  }

  get isParagraph () {
    return (
      this.field?.type.component === EFieldComponentID.INPUT_PARAGRAPH || false
    );
  }

  get readonly () {
    return this.$parent?.$attrs.readonly;
  }

  get fields () {
    return this.$parent?.$attrs.fields;
  }

  get field (): DDField {
    // @ts-ignore
    return (this.fields as any[]).find(
      (f:{[key:string]:any}) => f.id === this.field_id
    ) as DDField;
  }

  created () {
    this.editor = new Editor({
      extensions: [
        new BulletList(),
        new Heading({ levels: [1, 2, 3] }),
        new ListItem(),
        new OrderedList(),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History(),
        new FieldEmbeded()
      ],
      editable: false,
      content: this.field.value
    });
  }

  onSettings () {
    this.showTransforms = true
  }

  onSaveTransformations (toSave) {
    this.transformations = toSave
  }
}
</script>

<style lang="scss">
.embeded_container {
  display: inline-block;
  background-color: #dddddd;
  border-radius: 4px;
  margin: 0 4px;
  padding: 0;
  border: 1px solid #cccccc;
  .component-name {
    background-color: #eeeeee;
    padding: 4px 8px 2px 8px;
    margin: 4px 0 0 0;
    line-height: 0.9;
    border-radius: 4px;
  }
  .hide-selection {
    ::selection {

    }
  }
  > * {
    user-select: none;
  }

  &:hover {
    border: 1px solid #999999;
  }
}

.selected {
  background-color: #31CCEC;
  .component-name {
    background-color: #299cb3;
    color: white;
  }
}
</style>
