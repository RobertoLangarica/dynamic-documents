<template>
  <dd-doc v-if="authorized"
          class="dd"
          ref="doc_creation"
          :isTemplate="isTemplate"
          :id="id"
          :views="available_views"
          :downloadAuthorization="authorization"
          :initialView="initialView"
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
          handled = true
          /* Saving */
          await (this.$refs.doc_creation as any).saveAsNew()
          break;
        case 'save':
          handled = true
          /* Saving */
          await (this.$refs.doc_creation as any).onSaveChanges()
          break;
        case 'refresh':
          handled = true
          /* Refresh */
          await (this.$refs.doc_creation as any).refreshDocument()
          break;
        case 'set-fillmap-src':
          handled = true
          this.$root.$emit('set-fillmap-src', data.sources)
          break;
        case 'selected-fillmap-source':
          handled = true
          this.$root.$emit('selected-fillmap-source', data)
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }
}
</script>

<style lang="scss" scoped>
  .dd{
    border-radius: 6px;
  }
</style>
