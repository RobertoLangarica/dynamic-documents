<template>
    <q-badge color="yellow-5" class="row text-black cursor-pointer" multi-line @click="onClick">
        <q-icon name="bolt" size="sm" color="orange"/>
        <template v-if="hasMap">
            <span class="q-mx-sm">{{label}}</span>
            <q-btn round unelevated size="xs" icon="close" color="grey-6" @click="onDelete" :loading="loading"/>
        </template>
    </q-badge>
</template>

<script>
import FillmapMapDialog from './FillmapMapDialog.vue'
export default {
    data(){
        return { loading: false }
    },
    props:{
        map_id:{type:String, required:true},
        doc_type:{type:String, required:true}
    },
    computed:{
        fillmap(){
            // The containing fillmap
            let fillmaps = this.$store.getters['fillmaps/byDoc'](this.doc_type)
            return fillmaps.find(fillmap=>{
                let field = fillmap.fields.find(f=> this.map_id === f.destination || this.map_id === f.foreign)
                return !!field
            })
        },
        field(){
            if(!this.fillmap){
                return undefined
            }

            return this.fillmap.fields.find(f=> this.map_id === f.destination || this.map_id === f.foreign)
        },
        label(){
            if(!this.fillmap){
                return ''
            }
            
            switch(this.fillmap.source_type){
                case 'fisica':
                    return `Persona Fisica-${this.field.name}`;
                case 'moral':
                    return `Persona Moral-${this.field.name}`;
                case 'trust':
                    return `Fideicomiso-${this.field.name}`;
            }

            return 'Autocaptura'
        },
        hasMap(){
            return !!this.fillmap
        }
    },
    methods:{
        onClick(){
            // Nothing to do until the map is removed
            if(this.hasMap)return;

            // Opening the dialog for the field mapping
            this.$q.dialog({ component: FillmapMapDialog, parent: this, field_id: this.map_id, doc_type: this.doc_type })
        },
        async onDelete(){
            this.loading = true
            
            await this.$nextTick() // To avoid the component click handler

            let payload = Object.assign({},this.fillmap,{fields:this.fillmap.fields.concat()})
            let index = payload.fields.findIndex(f=> this.map_id === f.destination || this.map_id === f.foreign)
            
            if(index >= 0){
                payload.fields.splice(index,1)
            }

            let result = await this.$store.dispatch('fillmaps/setFillmap', payload)

            if(!result.success){
                this.$q.notify({ message: 'Ocurrió un problema al guardar los cambios', color: 'negative' })
            }

            this.loading = false
        }
    }
}
</script>