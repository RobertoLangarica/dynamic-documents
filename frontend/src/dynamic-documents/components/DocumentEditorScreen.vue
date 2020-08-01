<template>
    <div class="row q-col-gutter-md">
        <h2 class="col-12">{{name}}</h2>

        <field-type-selector class="col-12  q-mb-lg" @selected="onTypeSelected"/>

        <basic-field class="col-12" v-for="item in fields" :key="item.id" :field="item" :all_fields="manager.fields"
            @f-updated="onFieldUpdated"
            @f-deleted="onFieldDeleted"
            @f-added="onFieldAdded"
            />

    </div>
</template>

<script>
import { DDField } from '../src/DDField'

export default {
  name: 'document-editor',
  props: {
    captureMode: {
      type: Boolean,
      required: false,
      default: false
    },
    manager: {
      type: Object,
      required: false,
      default: () => {
        // DocumentEditionManager
        return {}
      }
    }
  },
  data () {
    return {
    }
  },
  mounted () {
    this.manager.store = this.$store
  },
  computed: {
    name: {
      get: function () {
        return this.manager.name
      },
      set: function (value) {
        this.manager.name = value
      }
    },
    fields () {
      return this.manager.fields.filter(f => f.group_by === '')
    }
  },
  methods: {
    onFieldUpdated (field) {
      this.manager.updateField(field)
    },
    onFieldDeleted (field) {
      this.manager.deleteField(field)
    },
    onFieldAdded (field) {
      this.manager.addField(field)
    },
    onTypeSelected (type) {
      let field = DDField.createFromType(type)
      field.initInEdition = true
      this.manager.addField(field)
    }
  }
}
</script>
