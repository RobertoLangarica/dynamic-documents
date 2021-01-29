<template>
  <div>
    <dd-doc ref="doc_creation"
        v-if="canShowDoc"
        :isTemplate="false" 
        :isFilter="true" 
        :id="id" 
        :forceViewOnly="readonly"
        @404="nonExistent"
        @expired="onExpired"
        @mount_ready="onReady"
        />
    <div v-else class="row justify-center items-center" >
        <h3>Este documento ya no está disponible</h3>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/pages/Document'

@Component({ components: { 'dd-doc': Document } })
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly id!: string;
    @Prop({ type: Boolean, required: false, default: false }) readonly readonly!: boolean;

    exists:boolean = true
    expired:boolean = false
    ready:boolean = false

    get canShowDoc(){
        if(!this.ready){
            return true
        }

        return !this.expired && this.exists
    }
    async onMessage (message, data) {
      switch (message) {
        default:
          console.log(`Unrecognized event->${message}`)
      }
    }

    onExpired(){
        this.expired = true
    }

    nonExistent(){
        this.exists = false
    }
    onReady(){
        let el =  this.$refs.doc_creation.$el
        this.sendMessage('dd_resize',{width:Math.max(el.scrollWidth,el.offsetWidth), height:Math.max(el.scrollHeight,el.offsetHeight)})

        this.$nextTick(()=>{
            this.ready = true
        })
    }
}
</script>