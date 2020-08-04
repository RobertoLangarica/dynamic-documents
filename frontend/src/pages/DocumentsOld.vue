<template>
  <nq-page title="Documents" max-width="lg">
    <template slot="aside">
      <template-menu
        :objects="templates"
        title="Plantillas"
        @select="onSelectedTemplate"
        @add="onShowCreation(true)"
      />
      <template-menu
        :objects="documents"
        title="Documentos"
        @select="onSelectedDocument"
        @add="onShowCreation(false)"
      />
    </template>

    <document-editor v-if="exist" :manager="manager" />

    <q-dialog v-model="show_creation" persistent>
      <template-creation-dialog :is-template="creating_template" />
    </q-dialog>
  </nq-page>
</template>

<script>
/* eslint-disable */

import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";

export default {
  data() {
    return {
      using_doc: false,
      type: "",
      manager: null,
      show_creation: false,
      creating_template: false,
      selected: null,
    };
  },
  mounted() {
    this.$store.commit("init");
    // TODO remove this override for authorization
    this.$api.setAuthorization(this.$store.state.login.token);
    this.$store.dispatch("getTemplates");
    this.$store.dispatch("getDocuments");
    this.$store.dispatch("updateTypes");
  },
  computed: {
    templates() {
      return this.$store.state.dd.templates;
    },
    documents() {
      return this.$store.state.dd.documents;
    },
    exist() {
      return this.selected && this.manager;
    },
  },
  methods: {
    async onSelectedTemplate(id) {
      this.manager = null;
      this.using_doc = false;
      this.selected = await this.$store.dispatch("getTemplate", id);
      this.updateManager(true);
    },
    async onSelectedDocument(id) {
      this.manager = null;
      this.using_doc = true;
      this.selected = await this.$store.dispatch("getDocument", id);
      this.updateManager(false);
    },
    updateManager(isTemplate) {
      this.manager = DocumentEditionManager.createFromRemoteObject(
        this.selected
      );
      this.manager.isTemplate = isTemplate;
      this.manager.isDocument = !isTemplate;
    },
    onShowCreation(isTemplate) {
      this.creating_template = isTemplate;
      this.show_creation = true;
    },
  },
};
</script>
