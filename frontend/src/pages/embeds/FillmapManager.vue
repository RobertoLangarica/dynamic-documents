<template>
  <div v-if="authorized" class="column" style="max-height: 100vh; height: 100vh;">
    <div class="col-auto row justify-between" v-if="!invisibleDialogs">
      <q-select
        class="col-4 q-pt-sm"
        v-model="selectedSrc"
        @input="(value)=>onDocumentSourceSelected(value)"
        :options="$store.state.dd.documents"
        option-value="id"
        option-label="name"
      />
      <q-select
        class="col-4 q-pt-sm q-pr-sm"
        v-model="selectedDest"
        @input="(value)=>onDocumentDestinationSelected(value)"
        :options="$store.state.dd.documents"
        option-value="id"
        option-label="name"
      />
    </div>

    <fillmap class="col" :source="source" :destination="destination" @save="onSaveChanges" @cancel="onCancel" />
  </div>
  <span v-else />
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import { IFillmap } from 'src/dynamic-documents/src/core/DDFillmap';
import { mixins } from 'vue-class-component';
import EmbedMixin from './EmbedMixin';
import Fillmap from 'src/components/dd/Fillmap/Fillmap.vue';
import fillmaps from 'src/store/dynamic-documents/fillmaps';

interface IObjectType{
    type:string;
    fields:DDField[];
    isDocument:boolean;
    documentID?:string;
}

@Component({ components: { fillmap: Fillmap } })
export default class FillmapManager extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly src!: string;
    @Prop({ type: String, required: false, default: '' }) readonly dest!: string;

    source: IObjectType | null = null;
    destination: IObjectType | null = null;
    selectedDest:any = null
    selectedSrc:any = null

    async mounted () {
      // TODO REMOVE this
      if (!this.invisibleDialogs) {
        void this.$store.dispatch("getDocuments");
      }

      if (this.dest) {
        this.destination = await this.getDocumentObjectType(this.dest)
      } else {
        // Waiting for external data
      }

      if (this.src) {
        this.source = await this.getDocumentObjectType(this.src)
      } else {
        // Waiting for external data
      }
    }

    async onDocumentSourceSelected (newSource) {
      // Selected here
      this.source = null
      this.source = await this.getDocumentObjectType(newSource.id)
    }

    async onDocumentDestinationSelected (newSource) {
      // Selected here
      this.destination = null
      this.destination = await this.getDocumentObjectType(newSource.id)
    }

    async getDocumentObjectType (id:string):Promise<IObjectType> {
      let doc = await this.$store.dispatch('getDocument', id)

      let result:IObjectType = {
        type: doc.type,
        isDocument: true,
        documentID: id,
        fields: doc.fields.map(f => Object.assign({}, f))
      }

      return result
    }

    onCancel () {
      if (!this.invisibleDialogs) {
        this.$router.go(-1)
      } else {
        this.sendMessage('fillmap_canceled')
      }
    }

    async onSaveChanges ({ fillmap, captured_values }:{fillmap:IFillmap, captured_values:{id:string, value:any}[]}) {
      let saving:Promise<any>[] = []
      // Saving doc
      if (this.destination?.isDocument) {
        saving.push(this.$store.dispatch('setDocument', { id: this.destination.documentID, fields: captured_values }))
      }

      // Saving fillmap
      saving.push(this.$store.dispatch('fillmaps/setFillmap', fillmap))

      Promise.all(saving)
        .then(results => {
          // Error
          if (results.find(i => !i.success)) {
            this.$q.notify({ message: 'Ocurrió un problema al guardar los cambios', color: 'negative' })
            return
          }

          // Save completed
          if (!this.invisibleDialogs) {
            // go back
            this.$router.go(-1)
          } else {
            // Return any change if the destination is not a document
            let data = this.destination?.isDocument ? undefined : { captured_values }
            this.sendMessage('fillmap_saved', data)
          }
        })
        .catch(e => {
          this.$q.notify({ message: 'Ocurrió un problema al guardar los cambios', color: 'negative' })
        })
    }

    async onMessage (message, data, handled = false) {
      console.log(message, data)
      switch (message) {
        case 'set_source_document':
          handled = true
          this.source = null
          this.source = await this.getDocumentObjectType(data.id)
          break;
        case 'set_destination':
          handled = true
          this.destination = data
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

    get invisibleDialogs () {
      return true
      // @ts-ignore
    //   return this.$root.invisibleDialogs
    }
}
</script>
