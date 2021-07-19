<template>
  <q-dialog ref="dialog" @hide="onDialogHide" @before-show="onBeforeOpen" persistent>
    <q-card class="q-dialog-plugin">
      <q-card-section class="row justify-between items-center">
        <span class="text-h5">Configurar auto captura</span>
        <div>
          <q-btn round flat icon="close" @click="onCancel" />
        </div>
      </q-card-section>
      <q-card-section>
        A partir de
        <q-select
          v-model="source"
          :options="sources"
          option-value="type"
          option-label="title"
          outlined
          @input="onSourceTypeSelected"
        />
      </q-card-section>
      <q-card-section>
        Utilizar
        <q-select
          v-model="field"
          :options="fields"
          option-value="id"
          option-label="name"
          outlined
          :disable="disabledFieldSelector"
        />
      </q-card-section>
      <q-card-actions class="q-pa-md q-mt-xl" align="center">
        <q-btn class="full-width" color="secondary" label="Aceptar" @click="onAccept" :disable="acceptDisabled" />
      </q-card-actions>
      <q-inner-loading :showing="loading" color="primary" />
    </q-card>
  </q-dialog>
</template>

<script>
import { QDialog } from "quasar";

export default {
  props: {
    doc_type: { type: String, required: true },
    field_id: { type: String, required: true }
  },
  data () {
    return {
      sources: [],
      source: null,
      fields: [],
      field: null,
      loading: false
    }
  },
  computed: {
    acceptDisabled () {
      return !this.field
    },
    disabledFieldSelector () {
      return !this.fields.length
    },
    fillmap () {
      return this.$store.getters['fillmaps/fillmap'](this.source ? this.source.type : '', this.doc_type, true)
    }
  },
  methods: {
    onBeforeOpen () {
      this.selectedSource = { type: 'none', title: 'None' }

      this.$root.$emit('send_message', { message: 'get-fillmap-src' })
      this.$root.$on('set-fillmap-src', (src) => {
        this.sources = [{ type: 'none', title: 'None' }].concat(src);
        this.source = this.sources[0]
        this.onSourceTypeSelected()
      })
    },
    show () {
      this.$refs.dialog.show();
    },
    hide () {
      this.$refs.dialog.hide();
    },
    onDialogHide () {
      this.$root.$off('set-fillmap-src')

      // required to be emitted
      this.$emit("hide");
    },
    onSourceTypeSelected () {
      this.fields = []
      this.field = null
      if (this.source.type === 'none') return;

      this.fields = this.source.fields.concat()
      this.field = this.fields[0]
    },
    async onAccept () {
      this.loading = true
      await this.$store.dispatch('fillmaps/getFillmap', { source: this.source.type, destination: this.doc_type })

      // Adding this field to the map
      let field
      if (this.fillmap.source_type === this.source.type) {
        field = { foreign: this.field.id, destination: this.field_id, name: this.field.name }
      } else {
        // Inverted map
        field = { destination: this.field.id, foreign: this.field_id, name: this.field.name }
      }

      let payload = Object.assign({}, this.fillmap, { fields: this.fillmap.fields.concat() })
      payload.fields.push(field)
      let result = await this.$store.dispatch('fillmaps/setFillmap', payload)

      this.loading = false
      if (!result.success) {
        this.$q.notify({ message: 'Ocurrió un problema al guardar los cambios', color: 'negative' })
      } else {
        this.$emit("ok");
        this.hide();
      }
    },
    onCancel () {
      this.hide();
    }
  }
}
</script>
