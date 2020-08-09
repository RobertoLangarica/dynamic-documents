<template>
  <article class="q-pa-lg">
    <div class="fixed-top-right bg-white q-pa-sm q-mr-md">
      <q-radio
        v-for="view in views"
        :key="view.value"
        v-model="currentView"
        :val="view.value"
        :label="view.label"
      />
    </div>
    <h1
      v-if="docReady"
      :contenteditable="currentView === 'edit'"
      @input="titleChanged"
    >
      {{ manager.name }}
    </h1>
    <div v-if="docReady" class="fields-container" :class="currentView">
      <field-group-component
        :fields="fields"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
        />
    </div>
    <q-spinner v-else color="primary" size="3em" :thickness="2" />
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import { DDField } from "src/dynamic-documents/src/core/DDField";

export enum IViews{
  EDIT,
  CAPTURE,
  PRINT,
}

@Component({})
export default class Document extends Vue {
  currentView: IViews = IViews.EDIT;
  manager!: DocumentEditionManager;
  fields:DDField[] = []
  docReady = false;

  views = [
    { label: "Editar", value: IViews.EDIT },
    { label: "Capturar", value: IViews.CAPTURE },
    { label: "Ver", value: IViews.PRINT }
  ];

  get isInEditView () {
    return this.currentView === IViews.EDIT;
  }

  get isInCaptureView () {
    return this.currentView === IViews.CAPTURE;
  }

  get isInPrintView () {
    return this.currentView === IViews.PRINT;
  }

  beforeDestroy () {
    this.$root.$off('f-add', this.onFieldAdded)
    this.$root.$off('f-update', this.onFieldUpdated)
    this.$root.$off('f-delete', this.onFieldDeleted)
  }

  async mounted () {
    this.$root.$on('f-add', this.onFieldAdded)
    this.$root.$on('f-update', this.onFieldUpdated)
    this.$root.$on('f-delete', this.onFieldDeleted)

    let document = await this.$store.dispatch(
      "getDocument",
      this.$route.params.id
    );
    await this.$store.dispatch("updateTypes");

    // TODO remove this login since it is only for test purposes
    if (!document) {
      return this.$router.push({ name: 'login' })
    }

    this.manager = DocumentEditionManager.createFromRemoteObject(document);
    this.fields = this.manager.fields;
    this.docReady = true;
    // TODO: Set these properties with the real data
    this.manager.isTemplate = false;
    this.manager.isDocument = true;
    this.manager.store = this.$store;
  }

  titleChanged (e) {
    console.log("titleChanged", e);
  }

  onFieldUpdated (field: DDField) {
    void this.manager.updateField(field);
  }

  onFieldDeleted (field: DDField) {
    void this.manager.deleteField(field);
  }

  onFieldAdded (field: DDField) {
    void this.manager.addField(field);
  }
}
</script>
