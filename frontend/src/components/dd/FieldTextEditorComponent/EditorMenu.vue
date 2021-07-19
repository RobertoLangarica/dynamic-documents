<template>
  <editor-menu-bar class="menubar" :class="{ 'is-hidden':hidden }" :editor="editor" v-slot="{ commands, isActive }">
    <div>
      <q-btn flat dense class="menubar__button" @click="$emit('embed_field',commands.field_embedded) " size="xs">
        <q-icon name="queue" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Agregar Campo
        </q-tooltip>
      </q-btn>

      <div class="divider"></div>

      <q-btn flat dense class="menubar__button" label="Estilo" size="xs" icon-right="arrow_drop_down">
        <q-tooltip anchor="top middle" self="bottom middle">
          Establecer Estilo del Parrafo
        </q-tooltip>
        <q-menu fit>
          <q-list class="condense-item">
            <q-item clickable v-close-popup class="ddmenu" :class="{ 'is-active': isActive.paragraph() }" @click.native="commands.paragraph">
              <q-item-section class="menubar__button normal">Normal</q-item-section>
            </q-item>
            <q-item clickable v-close-popup class="ddmenu" :class="{ 'is-active': isActive.heading({ level: 1 }) }" @click.native="commands.heading({ level: 1 })">
              <q-item-section class="menubar__button text-uppercase t1">Título 1</q-item-section>
            </q-item>
            <q-item clickable v-close-popup class="ddmenu" :class="{ 'is-active': isActive.heading({ level: 2 }) }" @click.native="commands.heading({ level: 2 })">
              <q-item-section class="menubar__button text-uppercase t2">Título 2</q-item-section>
            </q-item>
            <q-item clickable v-close-popup class="ddmenu" :class="{ 'is-active': isActive.heading({ level: 3 }) }" @click.native="commands.heading({ level: 3 })">
              <q-item-section class="menubar__button text-uppercase t3">Título 3</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <div class="divider"></div>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.bold() }" @click="commands.bold" size="xs">
        <q-icon name="format_bold" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Negritas
        </q-tooltip>
      </q-btn>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.italic() }" @click="commands.italic" size="xs">
        <q-icon name="format_italic" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Itálica
        </q-tooltip>
      </q-btn>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.underline() }" @click="commands.underline" size="xs">
        <q-icon name="format_underline" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Subrayado
        </q-tooltip>
      </q-btn>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.strike() }" @click="commands.strike" size="xs">
        <q-icon name="format_strikethrough" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Tachado
        </q-tooltip>
      </q-btn>

      <div class="divider"></div>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.bullet_list() }" @click="commands.bullet_list" size="xs">
        <q-icon name="format_list_bulleted" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Lista
        </q-tooltip>
      </q-btn>

      <q-btn flat dense class="menubar__button" :class="{ 'is-active': isActive.ordered_list() }" @click="commands.ordered_list" size="xs">
        <q-icon name="format_list_numbered" />
        <q-tooltip anchor="top middle" self="bottom middle">
          Lista Numerada
        </q-tooltip>
      </q-btn>

      <q-btn clickable v-close-popup :class="{ 'is-active': editor.activeMarkAttrs.aligntext.align === 'justify' }" @click="commands.aligntext({ align: 'justify' })">justify</q-btn>
      <q-btn clickable v-close-popup :class="{ 'is-active': editor.activeMarkAttrs.aligntext.align === 'left' }" @click="commands.aligntext({ align: 'left' })">left</q-btn>
      <q-btn clickable v-close-popup :class="{ 'is-active': editor.activeMarkAttrs.aligntext.align === 'center' }" @click="commands.aligntext({ align: 'center' })">center</q-btn>
      <q-btn clickable v-close-popup :class="{ 'is-active': editor.activeMarkAttrs.aligntext.align === 'right' }" @click="commands.aligntext({ align: 'right' })">right</q-btn>
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
    },
    hidden: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {}
  }
}
</script>

<style scoped lang="scss">
$color-black:rgb(.3,.3,.3);

.menubar {
    margin-bottom: 1rem;
    transition: all 0.2s 0.4s, opacity 0.2s 0.4s;
    height: 2rem;
  overflow: hidden;

    &.is-hidden {
        visibility: hidden;
        opacity: 0;
        height: 0rem;
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
    .divider {
      width: 2px;
      height: 1.25rem;
      background-color: rgba(13,13,13,.1);
      margin-left: 0px;
      margin-right: .25rem;
      display:inline-block;
    }
  }
  .ddmenu {
    .q-focus-helper {
      visibility: hidden !important;
    }
  }
  .condense-item {
    .q-item{
      min-height: 0px;
      padding: 0px;
      font-size: 10px;
    }
    .is-active {
      background-color: rgba(0, 0, 0, 0.1);
    }
    .t1 {
      font-weight:bolder;
      font-size: 14px;
    }
    .t2 {
      font-weight:bold;
      font-size: 12px;
    }
    .t3 {
      font-weight:normal;
      font-size: 10px;
    }
    .normal {
      font-weight:normal;
    }
  }
</style>
