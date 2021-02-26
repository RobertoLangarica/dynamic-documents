<template>
  <dd-doc v-if="authorized"
          ref="doc_creation"
          :isTemplate="isTemplate"
          :id="id"
          :views="available_views"
          :downloadAuthorization="authorization"
          @hook:created="addDocRefListeners"
  />
  <span v-else />
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/components/dd/Document.vue'

@Component({ components: { 'dd-doc': Document } })
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly id!: string;
    @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

    async onMessage (message, data, handled = false) {
      switch (message) {
        case 'create':
          /* Saving */
          try {
            let document = await (this.$refs.doc_creation as any).saveAsNew()
            this.sendMessage('created', document)
          } catch (e) {
            this.sendMessage('creation_error')
          }
          break;
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
}
</script>
