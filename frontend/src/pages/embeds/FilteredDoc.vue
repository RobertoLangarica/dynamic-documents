<template>
  <div>
    <dd-doc ref="doc_creation"
        v-if="exists && !expired"
        :isTemplate="false" 
        :isFilter="true" 
        :id="id" 
        @hook:updated.once="onDocMounted" 
        :forceViewOnly="readonly"
        @404="exists=false"
        @expired="expired=true"
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

    async onMessage (message, data) {
      switch (message) {
        default:
          console.log(`Unrecognized event->${message}`)
      }
    }

    onDocMounted(){
      // We need to wait a little bit in order to have the correct height
      // TODO remove this artificial wait
      // setTimeout(()=>{
      //   let el =  this.$refs.doc_creation.$el
      //   console.log(this.$refs.doc_creation)
      //   this.sendMessage('dd_resize',{width:Math.max(el.scrollWidth,el.offsetWidth), height:Math.max(el.scrollHeight,el.offsetHeight)})
      // },5000)
      this.$nextTick(()=>{
        let el =  this.$refs.doc_creation.$el
        this.sendMessage('dd_resize',{width:Math.max(el.scrollWidth,el.offsetWidth), height:Math.max(el.scrollHeight,el.offsetHeight)})
      })
    }
}
</script>