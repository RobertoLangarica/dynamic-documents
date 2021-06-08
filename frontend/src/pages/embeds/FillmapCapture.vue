<template>
  <span />
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { IFillmap, IFillmapField } from 'src/dynamic-documents/src/core/DDFillmap';
import { mixins } from 'vue-class-component';
import EmbedMixin from './EmbedMixin';
import { DDDocument } from 'src/dynamic-documents/src/core/DDDocument';


@Component({ })
export default class FillmapManager extends mixins(EmbedMixin) {
    @Prop({ type: String, required: true }) readonly document_id!: string;
    @Prop({ type: String, required: true }) readonly fillmap_type!: string;
    
    async afterAuthorization () {
      await Promise.all([
        this.$store.dispatch('getDocument', this.document_id),
        this.$store.dispatch('fillmaps/getFillmap', { source: this.fillmap_type, destination: this.document_id })
      ])

      this.sendMessage('fillmap_changes', this.getChangesFromDocument())
    }

    get fillmap ():IFillmap {
      return this.$store.getters['fillmaps/fillmap'](this.fillmap_type, this.document_id, true)
    }

    get document ():DDDocument {
      return this.$store.getters.document(this.document_id)
    }

    getChangesFromDocument () {
      let changes = {}

      this.fillmap.fields.forEach((map:IFillmapField) => {
        let fromDoc = this.document.fields?.find(f => f.map_id === map.foreign || f.map_id === map.destination || f.id === map.foreign || f.id === map.destination)

        if (fromDoc) {
          let key = map.foreign === fromDoc.map_id || map.foreign === fromDoc.id ? map.destination : map.foreign
          changes[key] = fromDoc.value
        }
      })

      return changes
    }
}
</script>
