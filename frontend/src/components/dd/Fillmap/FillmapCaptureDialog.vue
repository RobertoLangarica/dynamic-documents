<template>
  <q-dialog ref="dialog" @hide="onDialogHide" @before-show="onBeforeOpen" persistent>
    <q-card class="q-dialog-plugin" :class="{hidden:!visible}">
      <q-card-section class="row justify-between items-center">
        <span class="text-h5">Auto Capturar</span>
        <div>
            <q-btn round flat icon="close" @click="onCancel"/>
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
          <div class="row justify-between items-center">
            <template v-if="showSourceSelector">
            <div><q-badge color="grey-9 q-mr-md q-px-md q-py-xs">{{selectedSource.title}}</q-badge></div>
            <q-btn color="positive" label="Cambiar" icon="refresh" size="small" @click="onSourceTypeSelected"/>
            </template>
            <span v-else>--</span>
          </div>
      </q-card-section>
      <q-card-actions class="q-pa-md" align="center">
        <q-btn class="full-width" color="secondary" label="Aceptar" @click="onAccept" :disable="acceptDisabled"/>
      </q-card-actions>
    </q-card>
    <q-inner-loading :showing="loading" color="primary" class="bg-transparent" style="max-width:none; max-height:none;"/>
  </q-dialog>
</template>

<script>
export default {
    props:{
        manager:{type: Object, required: true},
        group_id:{type:String, required: false, default:''},
        field_id:{type:String, required: false, default:''},
        available_fillmaps:{type: Array, required:false, default:()=>[]}
    },
    data(){
        return {
            sources:[],
            source:null,
            loading:false,
            selectedSource:{type:'none', title:'None'}
        }
    },
    computed:{
        acceptDisabled(){
            return !this.selectedSource || this.selectedSource.type === 'none'
        },
        showSourceSelector(){
            return this.source ? this.source.type !== 'none' : false
        },
        fillmap () {
            return this.$store.getters['fillmaps/fillmap'](this.source ? this.source.type : '', this.manager.id, true)
        },
        visible(){
            return this.available_fillmaps.length > 1
        }
    },
    methods:{
        onBeforeOpen(){
            this.selectedSource = {type:'none', title:'None'}
            
            this.$root.$emit('send_message', {message: 'get-fillmap-src'})
            this.$root.$on('set-fillmap-src',(src)=>{
                // filter only for available fillmaps
                if(this.available_fillmaps.length > 0){
                    src = src.filter(map=>{
                        return !!this.available_fillmaps.find(f=>f.source_type === map.type || f.destination_type === map.type)
                    })

                    if(src.length === 1){
                        // Auto selection
                        this.sources = src;
                        this.source = src[0]
                        this.onSourceTypeSelected()
                        return
                    }
                } 

                // Normal user selection
                this.sources = [{type:'none', title:'None'}].concat(src);
                this.source = this.sources[0]

            } )

            this.$root.$on('selected-fillmap-source',(src)=>{
                this.selectedSource = src
                if(this.sources.length === 1){
                    // Auto select
                    this.onAccept()
                }
            } )
        },
        show () {
            this.$refs.dialog.show();
        },
        hide () {
            this.$refs.dialog.hide();
        },
        onDialogHide () {
            this.$root.$off('set-fillmap-src')
            this.$root.$off('selected-fillmap-source')

            // required to be emitted
            this.$emit("hide");
        },
        onSourceTypeSelected(){
            this.selectedSource = {type:'none', title:'None'}
            if(this.source.type === 'none')return;

            this.$root.$emit('send_message',{message:'select-fillmap-source', data:{type:this.source.type}})
        },
        async onAccept () {
            if(this.selectedSource.type === 'none'){
                return this.onCancel()
            }

            this.loading = true
            await this.$store.dispatch('fillmaps/getFillmap', { source: this.selectedSource.type, destination: this.manager.id })

            // Set all the available changes for destination
            this.fillmap.fields.forEach(map => {
                let destId;
                let src = this.selectedSource.fields.find(s => s.id === map.foreign || s.map_id === map.foreign)
                if (!src) {
                    // maybe the fillmap has destination/source instead of source/destination
                    src = this.selectedSource.fields.find(s => s.id === map.destination || s.map_id === map.destination)
                    destId = map.foreign
                } else {
                    destId = map.destination
                }

                let dest = this.manager.fields.find(s =>  s.map_id === destId || s.id === destId)

                if(dest && this.group_id && dest.group_by !== this.group_id){
                    // only valid group fields
                    dest = null
                } else if(dest && this.field_id && dest.id !== this.field_id){
                    // only valid fields
                    dest = null
                }

                if (!!dest && !!src) {
                // Valid change for the current objects
                this.manager.updateField({id:dest.id, value:src.value});
                }
            })
            this.$emit("ok");
            this.hide();
        },
        onCancel () {
            this.hide();
        }
    }
}
</script>

<style lang="scss" scoped>
.hidden{
    visibility: none;
}
</style>
