<template>
    <div>
        HOLA
        <dd-doc />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import EmbedMixin from './EmbedMixin'
import Document from 'src/pages/Document'

@Component({components:{'dd-doc':Document}})
export default class Creation extends mixins(EmbedMixin) {
    @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

    mounted(){
        // this.sendMessage('HOLA from within')
    }
}
</script>