<template>
  <editor-menu-bar class="q-mb-md q-mt-sm" :editor="editor" v-slot="{ commands, isActive }">
    <div class="row justify-between">
      <q-btn class="col-1 menubar__button" @click="$emit('add_image',commands.field_embedded) " size="xs">
        <q-icon name="image" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold" size="xs">
        <q-icon name="format_bold" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic" size="xs">
        <q-icon name="format_italic" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.strike() }" @click="commands.strike" size="xs">
        <q-icon name="format_strikethrough" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline" size="xs">
        <q-icon name="format_underline" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.paragraph() }" @click="commands.paragraph" size="xs">
        <q-icon name="post_add" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click="commands.heading({ level: 1 })" size="xs">
        H1
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click="commands.heading({ level: 2 })" size="xs">
        H2
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.heading({ level: 3 }) }" @click="commands.heading({ level: 3 })" size="xs">
        H3
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list" size="xs">
        <q-icon name="format_list_bulleted" />
      </q-btn>

      <q-btn class="col-1 menubar__button" :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list" size="xs">
        <q-icon name="format_list_numbered" />
      </q-btn>
    </div>
  </editor-menu-bar>
</template>

<script>
import { EditorMenuBar } from 'tiptap'
export default {
  components: {
    EditorMenuBar
  },
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  data () {
    return {}
  }
}
</script>
