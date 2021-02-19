<template>
  <div>
    <dd-doc ref="doc_creation"
            v-if="canShowDoc"
            :isTemplate="false"
            :isFilter="true"
            :id="id"
            :forceViewOnly="readonly"
            @expired="onExpired"
            :views="available_views"
    />
    <q-card v-else class="row justify-center items-center">
      <h3 v-if="!empty">Este documento ya no está disponible</h3>
      <h3 v-else>Documento  vacio</h3>
    </q-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/components/dd/Document.vue'
import IDDView from 'src/dynamic-documents/src/core/IDDView'

@Component({ components: { 'dd-doc': Document } })
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly id!: string;
    @Prop({ type: Boolean, required: false, default: false }) readonly readonly!: boolean;

    expired:boolean = false
    empty:boolean = false
    ready:boolean = false

    get canShowDoc () {
      if (!this.ready) {
        return true
      }

      return !this.expired && this.exists && !this.empty
    }

    async onMessage (message, data, handled = false) {
      switch (message) {
        case 'save':
          /* Saving */
          await (this.$refs.doc_creation as any).onSaveChanges()
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

    onExpired () {
      this.expired = true
    }

    setAvailableViews (document) {
      this.available_views = this.available_views.filter(v => v.value !== IDDView.EDIT)

      // Is there any field in capture or print
      let allowed_print = false
      let allowed_capture = false
      for (let i = 0; i < document.fields.length; i++) {
        let f = document.fields[i]
        allowed_capture = allowed_capture || f.show_in_capture
        allowed_print = allowed_print || f.show_in_print

        if (allowed_print && allowed_capture) {
          break;
        }
      }

      // There is no fields in print view
      if (!allowed_print) {
        this.available_views = this.available_views.filter(v => v.value !== IDDView.PRINT)
      }

      // There is no fields in capture view
      if (!allowed_capture) {
        this.available_views = this.available_views.filter(v => v.value !== IDDView.CAPTURE)
      }

      this.empty = this.available_views.length === 0
    }
}
</script>
