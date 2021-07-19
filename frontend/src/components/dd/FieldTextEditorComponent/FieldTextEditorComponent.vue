<template>
  <nq-field @focus="onFieldFocus" @blur="onFieldBlur" :readonly="readonly">
    <template v-slot:control>
      <div class="editor">
        <editor-menu :hidden="!focused" :editor="editor" @embed_field="addEmbeddedField" />
        <editor-content
          class="editor__content"
          :editor="editor"
          :readonly="readonly"
          :fields="fields"
        />
      </div>
    </template>
  </nq-field>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import {
  Editor,
  EditorContent,
  EditorView,
  EditorState,
  Transaction,
  Node,
  EditorMenuBar
} from "tiptap";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { findChildren } from "prosemirror-utils";
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
import EditorMenu from "./EditorMenu.vue";
import FieldEmbeded from "./FieldEmbedded";
import FieldSelectorDialog from "src/components/dd/FieldSelector/FieldSelectorDialog.vue";

@Component({
  components: { EditorContent, EditorMenuBar, EditorMenu },
  name: "field-text-editor-component"
})
export default class FieldTextEditorComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ type: Boolean, required: true }) readonly edit_view!: boolean;
  @Prop({ type: Boolean, required: true }) readonly capture_view!: boolean;
  @Prop({ type: Boolean, required: true }) readonly print_view!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) readonly readonly!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) readonly autoFocus!: boolean;
  @Prop({ type: Number, required: false, default: 500 }) readonly debounce!: number;
  @Prop({ type: Array, required: true }) readonly fields!: DDField[];
  @Prop({ required: false, default: "" }) readonly doc_id!: string;

  editor: Editor = {};
  focused: boolean = false;
  value:string = ''

  created () {
    this.value = this.field.value

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
      editable: !this.readonly,
      onUpdate: this.onEditorUpdate.bind(this),
      onInit: this.onEditorInit.bind(this),
      content: this.value
    });
  }

  mounted () {
    if (!this.readonly && this.autoFocus) {
      this.editor.focus();
    }
  }

  beforeDestroy () {
    this.editor.destroy();
  }

  @Watch("readonly")
  onReadonlyChange (value: boolean, oldValue: boolean) {
    this.editor.setOptions({ editable: !value });
  }

  onFieldFocus () {
    if (!this.readonly) {
      this.focused = true;
      this.editor.setOptions({ editable: true });
      this.editor.focus();
    }
  }

  onFieldBlur () {
    this.focused = false;
    this.editor.setOptions({ editable: false });
  }

  onGetField ({ id, set }) {
    let f = this.fields.find((f) => f.id === (id as string));
    if (f) {
      (set as (DDField) => void)(f);
    }
  }

  onEditorInit (event: { view: EditorView; state: EditorState }) {
    /**/
  }

  onEditorUpdate (event: {
    getHTML: () => string;
    getJSON: () => string;
    state: EditorState;
    transaction: Transaction;
  }) {
    this.value = event.getHTML();
    let embedChanges = this.getEmbeddedFieldsChanges(event.transaction.doc);

    let changes: DDField = {
      id: this.field.id,
      value: event.getHTML()
    } as DDField;
    Object.assign(changes, embedChanges);

    // Apply local changes
    Object.assign(this.field, changes)

    this.notifyUpdate(changes);
  }

  notifyUpdate (field: DDField) {
    this.$root.$emit("f-update", field);
  }

  addEmbeddedField (command) {
    this.$q
      .dialog({
        component: FieldSelectorDialog,
        parent: this,
        fields: this.fields.filter((f) => {
          let allowed = f.id !== this.field.id;

          // Avoiding circular references
          if (allowed && f.use_embedded) {
            // If a field contains me then I can't contain that field
            allowed = !f.embedded_fields?.find((i) => i === this.field.id);
          }

          return allowed;
        })
      })
      .onOk((toEmbed: DDField[]) => {
        this.editor.setOptions({ editable: true });

        toEmbed.forEach((f) => {
          /**
           * Adding embedded fields to the editor
           * command({component properties})
           * WARNING: This properties are being stored in the backend since the editor
           *    saves the html tags, so be careful with the properties.
           *    Eg. Passing {fields:this.fields} with result in all the fields being copied
           *    and stored in the resulting html tag
           * */
          command({ field_id: f.id, transformations: '' });
        });
      });
  }

  getEmbeddedFieldsChanges (doc: Node) {
    let children = this.getEmbeddedChildren(doc).map((i) => i.node.attrs.field_id);
    let cangesToUpdate: {
      use_embedded?: boolean;
      embedded_fields?: string[];
    } = {};

    let existing_fields = {}
    if (this.field.embedded_fields) {
      this.field.embedded_fields.forEach(f => {
        existing_fields[`${f}`] = false;
      })
    }

    // Mark as avalid the existing embeds in the editor, and add the new ones
    let addingOrDeletingFields = false
    children.forEach((f_id:string) => {
      if (existing_fields[f_id] !== undefined) {
        // Existing with probable change
        existing_fields[f_id] = true;
      } else {
        // Adding new embedded field
        existing_fields[f_id] = true;

        // To notify the change
        addingOrDeletingFields = true
      }
      cangesToUpdate.embedded_fields = cangesToUpdate.embedded_fields || []
      cangesToUpdate.embedded_fields.push(f_id)
    });

    // Any field was deleted
    let keys = Object.keys(existing_fields)
    for (let i = 0; i < keys.length; i++) {
      if (!existing_fields[keys[i]]) {
        // There was a delete
        addingOrDeletingFields = true
      }
    }

    if (!addingOrDeletingFields) {
      // there is no need for the embedded_fields to change
      delete cangesToUpdate.embedded_fields
    } else {
      // Avoiding duplicated id's
      if (cangesToUpdate.embedded_fields) {
        cangesToUpdate.embedded_fields = cangesToUpdate.embedded_fields.filter((f, index) => index === cangesToUpdate.embedded_fields?.findIndex(i => i === f))
      } else {
        // empty array in case of every field being deleted
        cangesToUpdate.embedded_fields = []
      }

      if ((!cangesToUpdate.embedded_fields || cangesToUpdate.embedded_fields.length === 0) && this.field.use_embedded) {
        // Change to false
        cangesToUpdate.use_embedded = false
      } else if ((!!cangesToUpdate.embedded_fields && cangesToUpdate.embedded_fields.length > 0) && !this.field.use_embedded) {
        // Change to true
        cangesToUpdate.use_embedded = true
      }
    }

    return cangesToUpdate;
  }

  getEmbeddedChildren (from: Node) {
    const predicate = (node) => node.type.name === "field_embedded";
    return findChildren(from, predicate, true);
  }
}
</script>

<style scoped lang="scss">
$color-black: rgb(0.3, 0.3, 0.3);
$color-white: rgb(1, 1, 1);
$color-grey: rgb(0.6, 0.6, 0.6);

.editor {
  position: relative;
  width: 100%;
  height: auto;
  margin: 0 auto;

  &__content {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    * {
      caret-color: currentColor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: $color-black;
      color: $color-white;
      font-size: 0.8rem;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: bold;
      background: rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      color: inherit;
    }

    blockquote {
      border-left: 3px solid rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
      padding-left: 0.8rem;
      font-style: italic;

      p {
        margin: 0;
      }
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        min-width: 1em;
        border: 2px solid $color-grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }
  }
}
</style>
