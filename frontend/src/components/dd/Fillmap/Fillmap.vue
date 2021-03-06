<template>
  <div class="column">
    <div class="col-auto row justify-between items-center">
      <div class="col-5">
        <strong v-if="source" class="q-ma-none">{{ source.title }}</strong>
      </div>
      <div class="col-5">
        <strong v-if="destination" class="q-ma-none">{{ destination.title }}</strong>
      </div>
    </div>
    <div class="col row justify-between" :class="{'content':source && destination, 'content-no-overflow':!source || !destinationFields}" style="position:relative;">
      <!-- SOURCE -->
      <div class="col-5 dd-edit-view" style="position:relative;">
        <field-group-component v-if="source"
                               :fields="sourceFields"
                               :fillmap_view_src="true"
                               @drag_fill="onFill"
                               class="col-12"
        />
        <div v-if="!source || loading_src" class="loading_container">
          <div class="bg" />
          <q-spinner color="primary" />
        </div>
      </div>
      <!-- DESTINATION -->
      <div class="col-5 dd-edit-view" style="position:relative;">
        <field-group-component v-if="destination"
                               :fields="destinationFields"
                               :fillmap_view_dest="true"
                               @remove_fill="onRemoveFill"
                               class="col-12"
        />
        <div v-if="!destination || loading_dest" class="loading_container">
          <div class="bg" />
          <q-spinner color="primary" />
        </div>
      </div>
    </div>
    <div v-if="!embedded" class="col-auto row justify-end q-pa-md q-col-gutter-x-xl">
      <div><q-btn color="secondary" flat label="Cancelar" @click="onCancel" /></div>
      <div><q-btn color="primary" label="Aceptar cambios" @click="onSaveChanges" /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { IFillmap } from 'src/dynamic-documents/src/core/DDFillmap';
import { DDField } from 'src/dynamic-documents/src/core/DDField';

interface IObjectType{
    title:string;
    type:string;
    fields:DDField[];
    isDocument:boolean;
    documentID?:string;
}

@Component({ name: 'Fillmap' })
export default class Fillmap extends Vue {
    @Prop({ type: Object, required: false, default: () => null }) source!:IObjectType|null;
    @Prop({ type: Object, required: false, default: () => null }) destination!:IObjectType|null;

    changes:IFillmap = {} as any
    fieldCapturedValues:{id:string, value:any}[] = []
    loading_dest:boolean = false
    loading_src:boolean = false
    initializing:boolean = false

    @Watch('source', { immediate: true })
    async onSourceChanged (value:IObjectType, old) {
      this.discardChanges({ source_type: value ? value.type : '' })

      if (value && this.destination && !this.initializing) {
        // Initialize again when both destination and source exists
        this.initializing = true
        // Load the fillmap
        this.loading_src = true
        await this.$store.dispatch('fillmaps/getFillmap', { source: value.type, destination: this.destination.type })
        this.loading_src = false

        this.$nextTick(() => {
          this.autoFill()
          this.initializing = false
        })
      }
    }

    @Watch('destination', { immediate: true })
    async onDestinationChanged (value:IObjectType, old) {
      this.discardChanges({ destination_type: value ? value.type : '' })

      if (value && this.source && !this.initializing) {
        // Initialize again when both destination and source exists
        this.initializing = true
        // Load the fillmap
        this.loading_dest = true
        await this.$store.dispatch('fillmaps/getFillmap', { source: this.source.type, destination: value.type })
        this.loading_dest = false

        this.$nextTick(() => {
          this.autoFill()
          this.initializing = false
        })
      }
    }

    get destinationFields () {
      if (this.destination) {
        if (this.destination.isDocument) {
          // filtering only the fields that can be captured
          return this.destination.fields.filter(field => {
            return field.show_in_capture && (!field.readonly && !(field.type.parameters.block_capture || false))
          })
        }

        return this.destination.fields
      }

      return []
    }

    get sourceFields () {
      if (this.source) {
        if (this.source.isDocument) {
          // filtering only the fields that can be captured
          return this.source.fields.filter(field => {
            return field.show_in_capture && (!field.readonly && !(field.type.parameters.block_capture || false))
          })
        }

        return this.source.fields
      }

      return []
    }

    get fillmap ():IFillmap {
      return this.$store.getters['fillmaps/fillmap'](this.source ? this.source.type : '', this.destination ? this.destination.type : '', true)
    }

    discardChanges (changes) {
      this.changes = Object.assign(this.changes, changes, { fields: [] })
      // eslint-disable-next-line no-unused-expressions
      this.destination?.fields.forEach(f => {
        delete f.map_value
        delete f.map_name
      })
      this.fieldCapturedValues = []
    }

    autoFill () {
      // Set all the available changes for destination
      this.fillmap.fields.forEach(map => {
        let destId;
        let src = this.source!.fields.find(s => s.id === map.foreign || s.map_id === map.foreign)
        if (!src) {
          // maybe the fillmap has destination/source instead of source/destination
          src = this.source!.fields.find(s => s.id === map.destination || s.map_id === map.destination)
          destId = map.foreign
        } else {
          destId = map.destination
        }

        let dest = this.destination!.fields.find(s => s.id === destId || s.map_id === destId)

        if (!!dest && !!src) {
          // Valid change for the current objects
          this.onChange(src, dest)
        } else {
          // Saving the change because they are still valid for the map
          this.changes.fields.push({ foreign: map.foreign, destination: map.destination })
        }
      })
    }

    onFill ({ from, to }:{[key:string]:string}) {
      let srcField = this.source!.fields.find(s => s.id === from)
      let destField = this.destination!.fields.find(d => d.id === to)

      this.onChange(srcField!, destField!)
    }

    onRemoveFill (from:string) {
      let destField = this.destination!.fields.find(d => d.id === from)

      this.onRemoveChange(destField!)
    }

    onRemoveChange (from:DDField) {
      let fromID = from.id

      if (this.destination!.isDocument) {
        fromID = from.map_id || from.id
      }

      // Delete changes
      let index:number = this.changes.fields.findIndex(item => item.destination === fromID)
      if (index >= 0) {
        this.changes.fields.splice(index, 1)
      }

      // Making the field reflect the change
      delete from.map_value
      delete from.map_name
      index = this.destination!.fields.findIndex(d => d.id === from.id)
      this.destination!.fields.splice(index, 1)
      this.destination!.fields.splice(index, 0, from)

      // Remove also from the captured values
      this.removeCapturedValue(from.id)
    }

    onChange (from:DDField, to:DDField) {
      let fromID = from.id
      let toID = to.id
      if (this.source!.isDocument) {
        fromID = from.map_id || from.id
      }
      if (this.destination!.isDocument) {
        toID = to.map_id || to.id
      }

      // Delete any change on the destination
      let index:number = this.changes.fields.findIndex(item => item.destination === toID)
      if (index >= 0) {
        this.changes.fields.splice(index, 1)
      }

      // Add new change to the map
      this.changes.fields.push({ foreign: fromID, destination: toID })

      // Making the field reflect the change
      to.map_value = from.value
      to.map_name = from.name
      index = this.destination!.fields.findIndex(d => d.id === to.id)
      this.destination!.fields.splice(index, 1)
      this.destination!.fields.splice(index, 0, to)

      // Add change for saving later
      this.addCapturedValue(to.id, from.value)
    }

    removeCapturedValue (id:string) {
      let index = this.fieldCapturedValues.findIndex(i => i.id === id)
      if (index >= 0) {
        // delete
        this.fieldCapturedValues.splice(index, 1)
      }
    }

    addCapturedValue (id:string, value:any) {
      let index = this.fieldCapturedValues.findIndex(i => i.id === id)
      if (index >= 0) {
        // delete/replace
        this.fieldCapturedValues.splice(index, 1)
        this.fieldCapturedValues.splice(index, 0, { id, value })
      } else {
        // new
        this.fieldCapturedValues.push({ id, value })
      }
    }

    onCancel () {
      this.$emit('cancel')
    }

    onSaveChanges () {
      // Sending the fillmap and fields changes
      let toSend = {
        captured_values: this.fieldCapturedValues.concat(),
        fillmap: Object.assign({}, this.fillmap, this.changes)
      }
      this.$emit('save', toSend)
    }

    get embedded () {
      // @ts-ignore
      return this.$root.invisibleDialogs
    }
}
</script>

<style scoped>

.content-no-overflow{
    overflow-x: hidden;
    overflow-y: hidden;
}
.content{
    overflow-x: hidden;
    overflow-y: auto;
}

.ghost {
    opacity: .5;
    width: auto;
}

.loading_container {
    position: absolute;
    top:0px;
    bottom:0px;
    left:0px;
    right:0px;
    min-height: 85vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
    overflow:hidden;
}
.loading_container .bg {
    position: absolute;
    top:0px;
    bottom:0px;
    left:0px;
    right:0px;
    background-color: white;
    opacity: .5;
}

.loading_container .q-spinner {
    width: 2.5rem;
    height: 2.5rem;
    margin-top: 30%;
}
</style>
