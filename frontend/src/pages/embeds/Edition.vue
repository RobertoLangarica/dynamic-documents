<template>
    <div>
        <dd-doc ref="doc_creation" :isTemplate="isTemplate" :id="id"/>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/pages/Document'

@Component({components:{'dd-doc':Document}})
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: String, required: false, default: '' }) readonly id!: string;
    @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

    async onMessage(message, data){
        switch(message){
            case 'create':
                /*Saving*/
                let document = await this.$refs.doc_creation.saveAsNew()
                this.sendMessage('created',document)
                break;
            default:
                console.log(`Unrecognized event->${message}`)
        }
    }
}
</script>