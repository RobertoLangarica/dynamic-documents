<template>
  <div>
    <template v-if="!readonly">
      <nq-field @focus="editor.focus()" @blur="focused=false">
        <template v-slot:control>
          <div class="editor">
            <editor-menu v-if="focused" :editor="editor" @add_image="addEmbeddedField" />
            <editor-content class="editor__content" :editor="editor" />
          </div>
        </template>
      </nq-field>
    </template>
    <span v-else v-html="value" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Editor, EditorContent, EditorState, Transaction, Node, EditorMenuBar } from 'tiptap'
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import {
  findChildren
} from 'prosemirror-utils'
import { v4 as uuidv4 } from 'uuid'
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

    editor:Editor = null
    focused:boolean = false

    mounted () {
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
        content: this.value,
        autoFocus: this.autoFocus,
        onUpdate: this.onUpdate,
        onFocus: () => { this.focused = true }
      })
    }

    beforeDestroy () {
      this.editor.destroy()
    }

    get value () {
      return this.field.value
    }

    onClick () {
      console.log('click')
      this.editor.focus()
    }

    onUpdate (event:{getHTML:()=>string, getJSON:()=>string, state: EditorState, transaction: Transaction}) {
      this.field.value = event.getHTML()
      // console.log(this.field.value)
      console.log(event.transaction)
      this.readEmbeddedFields(event.transaction.doc)
      console.log(this.field.value)
      this.notifyUpdate({ id: this.field.id, value: this.field.value } as DDField)
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
          toEmbed.forEach(f => {
            command({ field_id: f.name, editor_id: uuidv4() })
          })

          // Update field
          if (toEmbed.length > 0) {
            // this.field.use_embedded = true;
            // this.field.embedded_fields = this.field.embedded_fields || []

            // toEmbed.forEach(f => {
            //   if (!this.field.embedded_fields!.find(e => e === f.id)) {
            //   // No duplicated id's
            //   this.field.embedded_fields!.push(f.id)
            //   this.notifyUpdate({ id: this.field.id, use_embedded: this.field.use_embedded, embedded_fields: this.field.embedded_fields } as DDField)
            //   }
            // })
          }
        });
    }

    readEmbeddedFields (doc: Node) {
      const predicate = node => node.type.name === 'field_embedded';
      // const predicate = node => true;
      let children = findChildren(doc, predicate, true)
      console.log(children)
    }
}
</script>

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

  .menubar {
    margin-bottom: 1rem;
    transition: visibility 0.2s 0.4s, opacity 0.2s 0.4s;

    &.is-hidden {
        visibility: hidden;
        opacity: 0;
    }

    &.is-focused {
        visibility: visible;
        opacity: 1;
        transition: visibility 0.2s, opacity 0.2s;
    }

    &__button {
        font-weight: bold;
        display: inline-flex;
        background: transparent;
        border: 0;
        color: $color-black;
        padding: 0.2rem 0.5rem;
        margin-right: 0.2rem;
        border-radius: 3px;
        cursor: pointer;

        &:hover {
        background-color: rgba($color-black, 0.05);
        }

        &.is-active {
        background-color: rgba($color-black, 0.1);
        }
    }

    span#{&}__button {
        font-size: 13.3333px;
    }
    }
}
</style>
