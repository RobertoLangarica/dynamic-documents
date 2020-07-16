<template>
    <div class="row q-col-gutter-md">
        <h2 class="col-12">{{name}}</h2>

        <FieldTypeSelector class="col-12  q-mb-lg" @selected="onTypeSelected"/>

        <nq-input v-for="item in fields" :key="item.id" :value="item.name" disable/>
    </div>
</template>

<script>
import FieldTypeSelector from './FieldTypeSelector'
import { DDField } from '../src/DDField'

export default {
  components: {
    FieldTypeSelector
  },
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
      fields: []
    }
  },
  mounted () {
    this.fields = this.manager.fields
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
    }
  },
  methods: {
    onFieldUpdated (field) {
      this.manager.updateField(field)
    },
    onFielDeleted (field) {
      this.manager.deleteField(field)

      // The field is not necessary son of this screen
      let i = this.fields.findIndex(f => f.id === field.id)
      if (i >= 0) {
        this.fields.splice(i, 1)
      }
    },
    onFieldAdded (field) {
      this.manager.addField(field)
    },
    onTypeSelected (type) {
      let field = DDField.createFromType(type)
      this.manager.addField(field)
    }
  }
}
</script>
