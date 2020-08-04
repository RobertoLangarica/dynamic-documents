<template>
    <nq-field :label="name">
        <template v-slot:control>
            <div class="col-12 row">
                <field-type-selector class="col-12  q-mb-lg" @selected="onTypeSelected" label="Agregar campo en el grupo"/>
                <basic-field class="col-12" v-for="item in fields" :key="item.id" :field="item" :all_fields="all_fields"
                    @f-updated="onFieldUpdated"
                    @f-deleted="onFieldDeleted"
                    @f-added="onFieldAdded"
                    />
            </div>
        </template>
    </nq-field>
</template>

<script>

import { DDField } from '../src/core/DDField'

export default {
  name: 'dd-group',
  props: {
    field: {
      type: DDField,
      required: false,
      default: () => {
        // DDField
        return new DDField()
      }
    },
    all_fields: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {}
  },
  computed: {
    name () {
      return this.field.name
    },
    fields () {
      return this.all_fields.filter(f => f.group_by === this.field.id)
    }
  },
  methods: {
    onFieldUpdated (field) {
      this.$emit('f-updated', field)
    },
    onFieldDeleted (field) {
      this.$emit('f-deleted', field)
    },
    onFieldAdded (field) {
      this.$emit('f-added', field)
    },
    onTypeSelected (type) {
      let field = DDField.createFromType(type)
      field.initInEdition = true
      field.group_by = this.field.id

      this.$emit('f-added', field)
    }
  }
}
</script>
