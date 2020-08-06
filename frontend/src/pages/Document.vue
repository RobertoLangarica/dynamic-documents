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
        :fields="documentFields"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
        @f-add="onFieldAdded"
        @f-update="onFieldUpdated"
        @f-delete="onFieldDeleted" />
    </div>
    <q-spinner v-else color="primary" size="3em" :thickness="2" />
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import draggable from "vuedraggable";
import FieldComponent from "components/FieldComponent.vue";
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import FieldGroupComponent from 'components/dd/FieldGroupComponent'
import { DDField } from "src/dynamic-documents/src/core/DDField";

export enum IViews{
  EDIT,
  CAPTURE,
  PRINT,
}

@Component({ components: { FieldComponent, draggable, 'field-group-component': FieldGroupComponent } })
export default class Document extends Vue {
  currentView: IViews = IViews.EDIT;
  manager!: DocumentEditionManager;
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

  docReady = false;

  get documentFields () {
    return this.manager ? this.manager.fields : [];
  }

  get filteredFields () {
    return this.manager.fields.filter(
      (f) => f.group_by === "" || f.group_by === undefined
    );
  }

  async mounted () {
    let document = await this.$store.dispatch(
      "getDocument",
      this.$route.params.id
    );
    await this.$store.dispatch("updateTypes");
    // TODO remove this login push
    if (!document) {
      return this.$router.push({ name: 'login' })
    }

    this.manager = DocumentEditionManager.createFromRemoteObject(document);
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
    this.manager.updateField(field);
  }

  onFieldDeleted (field: DDField) {
    this.manager.deleteField(field);
  }

  onFieldAdded (field: DDField) {
    this.manager.addField(field);
    console.log(this.documentFields)
  }
}
</script>
