<template>
    <div class="row q-col-gutter-md">
        <h2 class="col-12">{{name}}</h2>

        <FieldTypeSelector class="col-12  q-mb-lg" @selected="onTypeSelected"/>

        <BasicField class="col-12" v-for="item in fields" :key="item.id" :field="item"
            @dd_updated="onFieldUpdated(item)"
            @dd_deleted="onFielDeleted(item)"
            @dd_added="onFieldAdded(item)"
            />
    </div>
</template>

<script>
import FieldTypeSelector from './FieldTypeSelector'
import BasicField from './BasicField'
import { DDField } from '../src/DDField'

export default {
  components: {
    FieldTypeSelector, BasicField
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
    },
    groupId: {
      type: String,
      required: false,
      default: ''
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
      if (this.groupId !== '') {
        return this.manager.fields.filter(f => f.id === this.groupId || f.group_by === this.groupId)
      }

      return this.manager.fields
    }
  },
  methods: {
    onFieldUpdated (field) {
      this.manager.updateField(field)
    },
    onFielDeleted (field) {
      this.manager.deleteField(field)

      // The field is not necessary son of this screen
      // let i = this.fields.findIndex(f => f.id === field.id)
      // if (i >= 0) {
      //   this.fields.splice(i, 1)
      // }
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
