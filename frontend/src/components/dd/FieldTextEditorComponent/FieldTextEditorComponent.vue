<template>
  <div>
    <!-- <template v-if="!readonly"> -->
    <nq-field @focus="onFieldFocus" @blur="onFieldBlur" :readonly="readonly">
      <template v-slot:control>
        <div class="editor">
          <editor-menu :hidden="!focused" :editor="editor" @add_image="addEmbeddedField" />
          <editor-content class="editor__content" :editor="editor" :readonly="readonly" :fields="fields" />
        </div>
      </template>
    </nq-field>
    <!-- </template> -->
    <!-- <span v-else v-html="value" /> -->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Editor, EditorContent, EditorView, EditorState, Transaction, Node, EditorMenuBar } from 'tiptap'
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import {
  findChildren
} from 'prosemirror-utils'
import { throttle } from 'underscore/modules/index'
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
} from 'tiptap-extensions'
import EditorMenu from './EditorMenu.vue'
import FieldEmbeded from './FieldEmbedded'
import FieldSelectorDialog from 'components/dd/FieldSelectorDialog.vue';

@Component({ components: { EditorContent, EditorMenuBar, EditorMenu }, name: 'field-text-editor-component' })
export default class FieldTextEditorComponent extends Vue {
    @Prop({ required: true }) readonly field!: DDField;
    @Prop({ type: Boolean, required: true }) readonly edit_view!: boolean;
    @Prop({ type: Boolean, required: true }) readonly capture_view!: boolean;
    @Prop({ type: Boolean, required: true }) readonly print_view!: boolean;
    @Prop({ type: Boolean, required: false, default: false }) readonly readonly!: boolean;
    @Prop({ type: Boolean, required: false, default: false }) readonly autoFocus!: boolean;
    @Prop({ type: Number, required: false, default: 500 }) readonly debounce!: number;
    @Prop({ type: Array, required: true }) readonly fields!: DDField[];
    @Prop({ required: false, default: '' }) readonly doc_id!:string ;

    editor:Editor = {}
    focused:boolean = false;
    embedded_fields:{[id:string]:boolean} = {}

    get value () {
      return this.field.value
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
        onUpdate: this.onEditorUpdate.bind(this),
        onInit: this.onEditorInit.bind(this),
        content: this.value
      });
    }

    mounted () {
      if (!this.readonly && this.autoFocus) {
        this.editor.focus()
      }
      this.$root.$on('get_field', this.onGetField.bind(this))
    }

    beforeDestroy () {
      this.$root.$off('get_field', this.onGetField.bind(this))
      this.editor.destroy()
    }

    @Watch('readonly')
    onReadonlyChange (value: boolean, oldValue:boolean) {
      // this.editor.setOptions({ editable: !value })
    }

    onFieldFocus () {
      if (!this.readonly) {
        this.focused = true
        // this.editor.setOptions({ editable: true })
        this.editor.focus()
      }
    }

    onFieldBlur () {
      this.focused = false
      // this.editor.setOptions({ editable: false })
    }

    onGetField ({ id, set }) {
      let f = this.fields.find(f => f.id === (id as string))
      if (f) {
        (set as (DDField)=>void)(f)
      }
    }

    onEditorInit (event:{view: EditorView, state: EditorState}) {
      let children = this.getEmbeddedChildren(event.state.doc)
      children.forEach(c => {
        this.embedded_fields[c.node.attrs.field_id] = true
      })
    }

    onEditorUpdate (event:{getHTML:()=>string, getJSON:()=>string, state: EditorState, transaction: Transaction}) {
      this.field.value = event.getHTML()
      console.log(this.field.value)
      let embedChanges = this.getEmbeddedFieldsChanges(event.transaction.doc)

      let changes:DDField = { id: this.field.id, value: this.field.value } as DDField
      Object.assign(changes, embedChanges)
      this.notifyUpdate(changes)
    }

    // Avoiding overflow of update calls
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    notifyUpdate: (field:DDField)=>void = throttle((field) => {
      this.$root.$emit('f-update', field)
    }, this.debounce, { leading: false })

    addEmbeddedField (command) {
      this.$q
        .dialog({
          component: FieldSelectorDialog,
          parent: this,
          fields: this.fields.filter(f => f.id !== this.field.id)
        })
        .onOk((toEmbed:DDField[]) => {
          console.log(toEmbed)
          this.editor.setOptions({ editable: false })

          toEmbed.forEach(f => {
            /**
             * Adding embedded fields to the editor
             * command({component properties})
             * WARNING: This properties are being stored in the backend since the editor
             *    saves the html tags, so be careful with the properties.
             *    Eg. Passing {fields:this.fields} with result in all the fields being copied
             *    and stored in the resulting html tag
             * */
            command({ field_id: f.id, doc_id: this.doc_id })
          })
        });
    }

    getEmbeddedFieldsChanges (doc: Node) {
      let children = this.getEmbeddedChildren(doc).map(i => i.node)
      let cangesToUpdate:{use_embedded?:boolean, embedded_fields?:string[]} = {};

      // Invalidation of al lthe existing embeds
      Object.keys(this.embedded_fields).forEach((k:string) => {
        this.embedded_fields[k] = false
      })

      // Mark as avalid the existing embeds in the editor
      children.forEach(c => {
        let f_id:string = c.attrs.field_id
        if (this.embedded_fields[f_id] !== undefined) {
          // Existing with probable change
          this.embedded_fields[f_id] = true;
        } else {
          // New embedded field
          this.embedded_fields[f_id] = true

          // Changes on local and remote field
          if (!this.field.use_embedded) {
            this.field.use_embedded = true
            cangesToUpdate.use_embedded = true
          }

          // Avoiding duplicated id's
          if (!this.field.embedded_fields?.find(e => e === f_id)) {
            this.field.embedded_fields = this.field.embedded_fields || []
            this.field.embedded_fields.push(f_id)
            cangesToUpdate.embedded_fields = this.field.embedded_fields;
          }
        }
      })

      // Check for deleted fields
      let deletion = false;
      Object.keys(this.embedded_fields).forEach((k:string) => {
        if (!this.embedded_fields[k]) {
          // deleted
          deletion = true
          let i = this.field.embedded_fields?.findIndex(e => e === k)
          this.field.embedded_fields?.splice(i || -1, 1)
          delete this.embedded_fields[k]
        }
      })

      // Avoid sending the embedded_fields without changes
      if (deletion) {
        if (this.field.embedded_fields?.length === 0) {
          this.field.use_embedded = false;
          cangesToUpdate.use_embedded = this.field.use_embedded
        }
        cangesToUpdate.embedded_fields = this.field.embedded_fields;
      }

      return cangesToUpdate
    }

    getEmbeddedChildren (from:Node) {
      const predicate = node => node.type.name === 'field_embedded';
      return findChildren(from, predicate, true)
    }
}
</script>

<style>
.ProseMirror:focus {
    outline: none;
  }
</style>

<style scoped lang="scss">
$color-black:rgb(.3,.3,.3);
$color-white:rgb(1,1,1);
$color-grey:rgb(.6,.6,.6);

.editor {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto 5rem auto;

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

      td, th {
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
        left: 0; right: 0; top: 0; bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px; top: 0; bottom: 0;
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
