<template>
<nq-page title="Documents" max-width="lg">
    <template slot="aside" >
      <template-menu :objects="templates" title="Plantillas" @select="onSelectedTemplate" @add="onShowCreation(true)"/>
      <template-menu :objects="documents" title="Documentos" @select="onSelectedDocument" @add="onShowCreation(false)"/>
    </template>

    <document-editor v-if="exist" :manager="manager"/>

    <q-dialog v-model="show_creation" persistent>
      <template-creation-dialog :isTemplate="creating_template"/>
    </q-dialog>
</nq-page>
</template>

<script>
/* eslint-disable */

import { DocumentEditionManager } from 'src/dynamic-documents/src/DocumentEditionManager'

export default {
  data () {
    return {
        using_doc:false,
        selected_id:"",
        type:"",
        manager:null,
        show_creation:false,
        creating_template:false
    }
  },
  mounted () {
    this.$store.commit("init");
    this.$api.setAuthorization(this.$store.state.login.token);
    this.$store.dispatch('getTemplates')
    this.$store.dispatch('getDocuments')
    this.$store.dispatch('updateTypes')
  },
  computed: {
    templates () {
      return this.$store.state.dd.templates
    },
    documents () {
      return this.$store.state.dd.documents
    },
    selected(){
        let result
        if(this.using_doc){
            result = this.$store.getters.document(this.selected_id)
        } else {
            result = this.$store.getters.template(this.selected_id)
        }

        if(!result)return null

        return result
    },
    exist(){
      return this.selected && this.manager
    }
  },
  methods:{
      async onSelectedTemplate(id){
          this.manager = null
          this.using_doc = false

          if(!this.$store.getters.template(id).fields){
            await this.$store.dispatch('updateTemplate', id)
          }

          this.selected_id = id;

          this.updateManager(true)
      },
      async onSelectedDocument(id){
          this.manager = null
          this.using_doc = true
          
          if(!this.$store.getters.document(id).fields){
            await this.$store.dispatch('updateDocument', id)
          }

          this.selected_id = id;

          this.updateManager(false)
      },
      updateManager(isTemplate){
        this.$nextTick(()=>{
          this.manager = DocumentEditionManager.createFromRemoteObject(this.selected)
          this.manager.isTemplate = isTemplate
          this.manager.isDocument = !isTemplate
        })
      },
      onShowCreation(isTemplate){
        this.creating_template = isTemplate;
        this.show_creation = true
      }
  }
}
</script>
