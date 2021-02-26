<template>
  <dd-doc v-if="authorized"
          ref="doc_creation"
          :isTemplate="isTemplate"
          :id="id"
          :views="available_views"
          :allowDownload="false"
          @hook:created="addDocRefListeners"
  />
  <span v-else />
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
    @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

    onMessage (message, data, handled = false) {
      switch (message) {
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

    setAvailableViews (document) {
      this.available_views = []
    }
}
</script>
