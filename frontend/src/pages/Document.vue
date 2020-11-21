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
    <h1 v-if="docReady" :contenteditable="isInEditView" @input="titleChanged">{{ manager.name }}</h1>
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import { DDField } from "src/dynamic-documents/src/core/DDField";

export enum IViews {
  EDIT,
  CAPTURE,
  PRINT,
}

@Component({})
export default class Document extends Vue {
  @Prop({ type: String, required: false, default: '' }) readonly id!: string;
  @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;

  currentView: IViews = IViews.EDIT;
  manager!: DocumentEditionManager;
  fields: DDField[] = [];
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
    this.$root.$off("f-add", this.onFieldAdded.bind(this));
    this.$root.$off("f-update", this.onFieldUpdated.bind(this));
    this.$root.$off("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$off("f-sort_fields", this.onSortedFields.bind(this));
    this.$root.$off("f-add_under_sort_index", this.onFieldInserted.bind(this));
  }

  
  async beforeMount(){
    await this.$store.dispatch("updateTypes");
    await this.$store.dispatch("updateTransformations");
  }

  async mounted () {
    this.$root.$on("f-add", this.onFieldAdded.bind(this));
    this.$root.$on("f-update", this.onFieldUpdated.bind(this));
    this.$root.$on("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$on("f-sort_fields", this.onSortedFields.bind(this));
    this.$root.$on("f-add_under_sort_index", this.onFieldInserted.bind(this));

    let document
    if(this.id != ''){
      document = await this.$store.dispatch(
        "getDocument",
        this.id
      );
    } else {
      // This is an empty documents
    }

    this.manager = document ? DocumentEditionManager.createFromRemoteObject(document) : new DocumentEditionManager();

    this.fields = this.manager.fields;
    this.manager.isTemplate = this.isTemplate;
    this.manager.isDocument = true;
    // The store syncs an existing doc
    this.manager.store = document ? this.$store : null;

    console.log(this.manager)
    this.docReady = true;
  }

  onSortedFields (sorted: DDField[]) {
    void this.manager.updateFields(
      sorted.map((item) => {
        // Minimizing the data being send
        return { id: item.id, sort_index: item.sort_index } as DDField;
      })
    );
    // sorting the fields
    this.manager.fields = this.manager.fields.sort(
      (a, b) => a.sort_index - b.sort_index
    );
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

  onFieldInserted (params: { field: DDField; index: number }) {
    void this.manager.addFieldAtSortIndex(params.field, params.index);
  }
}
</script>
