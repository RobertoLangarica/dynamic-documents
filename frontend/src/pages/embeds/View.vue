<template>
    <dd-doc ref="doc_creation" :isTemplate="isTemplate" :id="id" :forceViewOnly="true" @hook:updated.once="onDocMounted"/>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/pages/Document'

@Component({ components: { 'dd-doc': Document } })
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly id!: string;
    @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

    async onMessage (message, data) {
      switch (message) {
        case 'get_fields':
          let fields = this.$refs.doc_creation.getFields()
          this.sendMessage('set_fields',fields)
          break;
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
