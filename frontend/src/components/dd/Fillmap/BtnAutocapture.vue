<template>
    <button class="auto-capture bg-grey-5" :class="{hidden:!visible}" @click="onCapture">
        <q-icon name="description"/>
        <span v-if="label" class="q-mx-xs">{{label}}</span>
    </button>
</template>

<script>
import FillmapCaptureDialog from './FillmapCaptureDialog.vue'
import FillmapMapDialog from './FillmapMapDialog.vue'

export default {
    components:{FillmapCaptureDialog},
    props:{
        manager:{type: Object, required: true},
        label:{type:String, required:false, default:''},
        field_id:{type:String, required:false, default:''},
        group_id:{type:String, required: false, default:''},
        single_field:{type:Boolean, required: false, default:false},
    },
    computed:{
        doc_type(){return this.manager.id},
        map_id(){
            let field = this.manager.fields.find(field=>field.id === this.field_id) 
            return field ? (field.map_id || field.id):''
        },
        fillmaps(){
            // The containing fillmaps
            let fillmaps = this.$store.getters['fillmaps/byDoc'](this.doc_type)

            if(this.map_id){
                // single field
                return fillmaps.filter(fillmap=>{
                    // filtering all the fillmaps containing this field
                    let field = fillmap.fields.find(f=> this.map_id === f.destination || this.map_id === f.foreign)
                    return !!field
                })
            } else if(this.group_id){
                // group
                let fields = this.manager.getGroupFields(this.group_id).map(f=>f.map_id || f.id)
                return fillmaps.filter(fillmap=>{
                    // filtering all the fillmaps containing at least one field from the group
                    let field
                    for(let i = 0; i < fields.length; i++){
                        let id = fields[i]
                        field = fillmap.fields.find(f=> id === f.destination || id === f.foreign)
                        if(field){
                            break;
                        }
                    }
                    return !!field
                })
            } 

            // document

            return fillmaps.filter(m=>!!m.fields.length)// only the fillmaps with some field
        },
        visible(){
            return !!this.fillmaps.length
        }
    },
    methods:{
        onCapture(){
            this.$q.dialog({ component: FillmapCaptureDialog, parent: this, group_id: this.group_id,field_id: this.field_id, manager:this.manager, available_fillmaps:this.fillmaps })
        }
    }
}
</script>

<style lang="scss" scoped>
.auto-capture{
    display: inline-block;
    color:white;
    text-transform: lowercase;
    height: 1.7em;
    // padding: .1em .5em 0em .5em;
    border-radius: 6px;
    cursor: pointer;
    align-self: center;
    border-width: 0px;
}

.auto-capture:hover{
  color:grey;
}

.auto-capture:active{
  transform: scale(0.95);
}

.hidden{
    visibility: none;
}
</style>