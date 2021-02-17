<template>
  <div class="embeded_container row items-center">
    <!-- EDIT MODE -->
    <template v-if="!readonly">
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
      <q-badge>{{ name }}</q-badge>
      <q-btn icon="settings" flat round size="md" dense class="cursor-drag" color="grey" @click="onSettings" />
    </template>
    <template v-else>
      <span v-if="!isParagraph">{{ transformedValue }}</span>
      <editor-content v-else :editor="editor" :readonly="true" :fields="fields" />
    </template>
    <transformations-dialog v-model="showTransforms" :field_value="value" @ok="onSaveTransformations" :initial_transformations="transformations.split(',')" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
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

import TransformationsDialog from "components/dd/TransformationsDialog.vue";

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
    return Transforms.apply(this.transformations.split(','), this.value)
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
    return this.$parent.$attrs.fields.find(
      (f) => f.id === this.field_id
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

<style scoped>
.embeded_container {
  display: inline-block;
}
</style>
