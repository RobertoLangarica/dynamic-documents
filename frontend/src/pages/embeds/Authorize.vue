<template>
    <span>AUTHORIZING</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'

import EmbedMixin from './EmbedMixin'

@Component({})
export default class Authorize extends mixins(EmbedMixin){
    mounted(){
        // this.sendMessage('HOLA from within')
    }
    onMessage(message, data){
        switch(message){
            case 'authorize':
                /*
                    Adding this token as authorization. 
                    This token should not be stored in the Vuex.store nor LocalStorage
                */
                this.$api.setAuthorization(data.token,'');
                this.$router.replace({ name: data.location })
                break;
            default:
                console.log(`Unrecognized event->${message}`)
        }
    }
}
</script>