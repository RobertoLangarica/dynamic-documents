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
      <draggable
        v-model="filteredFields"
        handle=".cursor-drag"
        @start="drag=true"
        @end="drag=false"
      >
        <field-component
          v-for="field in manager.fields"
          :key="field.id"
          :field="field"
          :fields="filteredFields"
          :is-in-edit-view="isInEditView"
          :is-in-capture-view="isInCaptureView"
          :is-in-print-view="isInPrintView"
          @onShowAddFieldDialog="showAddFieldDialog"
        />
      </draggable>
      <q-btn
        icon="add"
        rounded
        flat
        size="md"
        class="cursor-pointer"
        color="grey"
        label="Agregar un campo"
        @click="showAddFieldDialog"
      />
    </div>
    <q-spinner v-else color="primary" size="3em" :thickness="2" />
  </article>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import draggable from "vuedraggable";
import FieldTypeDialog from "components/FieldTypeDialog.vue";
import FieldComponent from "components/FieldComponent.vue";
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";

export enum IViews {
  EDIT,
  CAPTURE,
  PRINT,
}

@Component({ components: { FieldComponent, draggable } })
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
    // TODO: Change this once the store is migrated to TS
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
    this.manager = DocumentEditionManager.createFromRemoteObject(document);
    this.docReady = true;
    // TODO: Set these properties with the real data
    this.manager.isTemplate = false;
    this.manager.isDocument = true;
  }

  titleChanged (e) {
    console.log("titleChanged", e);
  }

  showAddFieldDialog () {
    this.$q
      .dialog({
        component: FieldTypeDialog,
        // optional if you want to have access to
        // Router, Vuex store, and so on, in your
        // custom component:
        parent: this, // becomes child of this Vue node
        // ("this" points to your Vue component)
        // props forwarded to component
        // (everything except "component" and "parent" props above):
        text: "something"
        // ...more.props...
      })
      .onOk((type) => {
        console.log("OK", type);
      });
  }
}
</script>
