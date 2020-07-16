<template>
<nq-page title="Documents" max-width="lg">
    <template slot="aside" >
      <TemplateMenu :objects="templates" title="Plantillas" @select="onSelectedTemplate"/>
      <TemplateMenu :objects="documents" title="Documentos" @select="onSelectedDocument"/>
    </template>

    <DocumentEditorScreen v-if="exist" :manager="manager"/>

</nq-page>
</template>

<script>
/* eslint-disable */

import TemplateMenu from 'components/TemplateMenu'
import { DocumentEditionManager } from 'src/dynamic-documents/src/DocumentEditionManager'
import DocumentEditorScreen  from 'src/dynamic-documents/components/DocumentEditorScreen'

export default {
  components: { TemplateMenu, DocumentEditorScreen},
  data () {
    return {
        using_doc:false,
        selected_id:"",
        type:"",
        manager:null
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
      }
  }
}
</script>
