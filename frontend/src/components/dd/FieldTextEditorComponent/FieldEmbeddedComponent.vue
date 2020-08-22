<template>
  <div class="embeded_container row items-center">
    <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    <strong @click="onClick"> {{ field_id }}</strong>
    <q-badge>{{ editor_id }}</q-badge>
    <q-btn icon="settings" flat round size="md" dense class="cursor-drag" color="grey" />
  </div>
  <!-- <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" /> -->
</template>

<script>
export default {
  props: [
    'node',
    'updateAttrs',
    'view'
  ],
  data () {
    return {}
  },
  computed: {
    field_id: {
      get () {
        return this.node.attrs.field_id
      },
      set (value) {
        this.updateAttrs({ field_id: value })
      }
    },
    editor_id () {
      return this.node.attrs.editor_id
    }
  },
  methods: {
    onClick () {
      this.label = 'On click!'
    }
  }
}
</script>

<style scoped>
    .embeded_container {
        display: inline-block;

    }
</style>
