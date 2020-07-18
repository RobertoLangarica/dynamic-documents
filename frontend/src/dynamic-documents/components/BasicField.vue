<template>
    <div class="row q-col-gutter-y-sm">
    <div class="col-12 row items-center justify-between">
        <h3>{{name}}</h3>
        <div><q-btn round :icon="!editMode ? 'edit':'close'" color="primary" flat @click="editMode=!editMode"/></div>
    </div>
    <nq-input v-if="editMode" class="col-12" v-model="name" dense label="Nombre" :debounce="1000"/>
    <nq-input v-if="editMode" class="col-12" v-model="value" dense :hint="type" label="Valor" :debounce="1000"/>
    <span v-if="!editMode" class="col-12">{{value}}</span>

    </div>
</template>

<script>
import { DDField } from '../src/DDField'
export default {
  props: {
    field: {
      type: Object,
      required: false,
      default: () => {
        // DDField
        return new DDField()
      }
    }
  },
  data () {
    return {
      editMode: false
    }
  },
  computed: {
    name: {
      get: function () {
        return this.field.name
      },
      set: function (value) {
        this.field.name = value
        this.updated()
      }
    },
    value: {
      get: function () {
        return this.field.value
      },
      set: function (value) {
        this.field.value = value
        this.updated()
      }
    },
    type () {
      return this.field.type.name
    }
  },
  methods: {
    updated () {
      this.$emit('dd_updated')
    },
    deleted () {
      this.$emit('dd_deleted')
    },
    added () {
      this.$emit('dd_added')
    }
  }
}
</script>
