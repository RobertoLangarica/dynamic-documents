<template>
  <q-badge color="yellow-5" class="row text-black cursor-pointer" multi-line @click="onClick">
    <q-icon name="bolt" size="sm" color="orange" />
    <template v-if="hasMap">
      <span class="q-mx-sm">{{ label }}</span>
      <q-btn round unelevated size="xs" icon="close" color="grey-6" @click.stop="onDelete" :loading="loading" />
    </template>
  </q-badge>
</template>

<script>
import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'
import FillmapMapDialog from './FillmapMapDialog.vue'

export default Vue.extend({
  props: {
    manager: { type: Object, required: true },
    field_id: { type: String, required: false, default: '' },
    doc_type: { type: String, required: true }
  },
  data () {
    return { loading: false }
  },
  computed: {
    doc_field () {
      return this.manager.fields.find(f => f.id === this.field_id)
    },
    map_id () {
      return this.doc_field.map_id || this.doc_field.id
    },
    fillmap () {
      // The containing fillmap
      let fillmaps = this.$store.getters['fillmaps/byDoc'](this.doc_type)
      return fillmaps.find(fillmap => {
        let field = fillmap.fields.find(f => this.map_id === f.destination || this.map_id === f.foreign)
        return !!field
      })
    },
    field () {
      if (!this.fillmap) {
        return undefined
      }

      return this.fillmap.fields.find(f => this.map_id === f.destination || this.map_id === f.foreign)
    },
    label () {
      if (!this.fillmap) {
        return ''
      }

      switch (this.fillmap.source_type) {
        case 'fisica':
          return `Persona Fisica-${this.field.name}`;
        case 'moral':
          return `Persona Moral-${this.field.name}`;
        case 'trust':
          return `Fideicomiso-${this.field.name}`;
      }

      return 'Autocaptura'
    },
    hasMap () {
      return !!this.fillmap
    }
  },
  methods: {
    onClick () {
      // Nothing to do until the map is removed
      if (this.hasMap) return;

      // checking if this field needs to be saved before
      if (!this.manager.canBeCopiedOrReplicated(this.field_id)) {
      // need saving
        this.$q.notify({ message: 'Primero debes guardar los cambios!', color: 'secondary' })
        return
      }

      // Opening the dialog for the field mapping
      this.$q.dialog({ component: FillmapMapDialog, parent: this, field_id: this.map_id, doc_type: this.doc_type })
    },
    async onDelete () {
      this.loading = true

      // await this.$nextTick() // To avoid the component click handler

      // Any other field on the document share the same fillmap
      let another = this.manager.fields.find(f => f.id !== this.field_id && (f.map_id === this.field_id || f.id === this.map_id || f.map_id === this.map_id))

      if (another) {
        // can't change the fillmap since another field is using it
        // new map_id for this field
        this.manager.updateField({ id: this.field_id, map_id: uuidv4() })
      } else {
        // delete
        let index = this.fillmap.fields.findIndex(f => this.map_id === f.destination || this.map_id === f.foreign)
        if (index >= 0) {
          let result = await this.$store.dispatch('fillmaps/deleteField', { fillmap_id: this.fillmap.id, field_identifier: this.map_id })

          if (!result.success) {
            this.$q.notify({ message: 'Ocurrió un problema al guardar los cambios', color: 'negative' })
          }
        }
      }
      this.loading = false
    }
  }
})
</script>
