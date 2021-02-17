<template>
  <article class="document-container q-pa-md">
    <h1 v-if="docReady" :contenteditable="isInEditView"
        @input="e=>name=e.target.innerText">
      {{ initialName }}
    </h1>
    <div v-if="docReady" class="dd-fields-container page" :class="{'dd-edit-view': isInEditView, 'dd-capture-view': isInCaptureView, 'dd-print-view': isInPrintView}">
      <field-group-component
        :fields="fields"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
      />
    </div>
    <template v-if="docReady">
      <div v-if="views.length > 0" class="fixed-top-right q-py-sm q-px-none bg-white column justify-end shadow-1 q-mt-md view-buttons-container">
        <q-btn
          flat align="left"
          :color="view.value === currentView ? 'info' : 'grey-7'"
          v-for="view in views"
          :key="`view_${view.value}`"
          @click.native="currentView = view.value"
          :icon="view.value === 0 ? 'edit' : view.value === 1 ? 'keyboard' : view.value === 2 ? 'preview' : ''"
          :label="view.label"
        />
        <hr v-if="showDownload">
        <q-btn v-if="showDownload"
               flat align="left"
               color="grey-7"
               label="Imprimir" icon="print" @click="onPrint" />
        <q-btn v-if="showDownload"
               flat align="left"
               color="grey-7"
               label="Descargar" icon="download" @click="onDownload" />
      </div>
    </template>
    <q-inner-loading :showing="downloading" />
  </article>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import IDDView from "src/dynamic-documents/src/core/IDDView";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { throttle } from "underscore/modules/index";

@Component({})
export default class Document extends Vue {
  @Prop({ type: String, required: false, default: '' }) readonly id!: string;
  @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) readonly isFilter!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) readonly allowDownload!:boolean;
  @Prop({ type: String, required: false, default: '' }) readonly downloadAuth!:boolean;
  @Prop({
    type: Array,
    required: false,
    default: () => [
      { label: "Editar", value: IDDView.EDIT },
      { label: "Capturar", value: IDDView.CAPTURE },
      { label: "Ver", value: IDDView.PRINT }
    ]
  }) readonly views!:any[];

  debounce: number = 500
  currentView: IDDView = IDDView.EDIT
  manager: DocumentEditionManager = {} as any;
  fields: DDField[] = [];
  docReady = false;
  creatingNewDocument:boolean = false
  initialName: string = "";
  downloading:boolean = false

  @Watch('views', { immediate: true })
  onAllowedViewschanged (value:any[], old:any[]) {
    if (!value.find(v => v.value === this.currentView)) {
      // Selecting an allowed view
      this.currentView = value.length ? value[0].value : IDDView.PRINT
    }
  }

  get isInEditView () {
    return this.currentView === IDDView.EDIT;
  }

  get isInCaptureView () {
    return this.currentView === IDDView.CAPTURE;
  }

  get isInPrintView () {
    return this.currentView === IDDView.PRINT;
  }

  get showDownload () {
    return this.allowDownload && this.isInPrintView && this.docReady && !this.creatingNewDocument && !this.isTemplate && !this.isFilter
  }

  get name () {
    return this.manager ? this.manager.name : '';
  }

  set name (value) {
    this.manager.name = value;
    this.updateDocument({ name: value }, this.manager)// Sending only the data that changed
  }

  beforeDestroy () {
    this.$root.$off("f-add");
    this.$root.$off("f-update");
    this.$root.$off("f-delete");
    this.$root.$off("f-sort_field");
    this.$root.$off("f-add_under_sort_index");
  }

  beforeMount () {
    void this.$store.dispatch("getTransformations");
    void this.$store.dispatch("getTypes");
  }

  async loadDocument () {
    let document
    if (!this.id) {
      // empty doc
      return null
    }

    let action = this.isTemplate ? 'getTemplate' : this.isFilter ? 'doc_filters/getFilteredDocument' : 'getDocument'
    document = await this.$store.dispatch(action, this.id);

    if (!document || document.success === false) {
      // Load failed
      if (this.isFilter && document?.filter_expired) {
        this.$emit('expired')
      } else {
        // TODO do something
      }
      return null
    }

    return document
  }

  async mounted () {
    this.$root.$on("f-add", this.onFieldAdded.bind(this));
    this.$root.$on("f-update", this.onFieldUpdated.bind(this));
    this.$root.$on("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$on("f-sort_field", this.onSortField.bind(this));
    this.$root.$on("f-add_under_sort_index", this.onFieldInserted.bind(this));

    let document = await this.loadDocument()
    this.$emit('loaded_document', document)

    this.manager = document ? DocumentEditionManager.createFromRemoteObject(document) : new DocumentEditionManager();
    if (!document) {
      // Placeholder name
      this.manager.name = (this.isTemplate ? 'Plantilla' : 'Documento') + ' sin nombre'
      this.creatingNewDocument = true
    }
    this.initialName = this.manager.name;

    this.fields = this.manager.fields;
    this.manager.isTemplate = this.isTemplate;
    this.manager.isDocument = !this.isTemplate && !this.isFilter;
    this.manager.isFilter = this.isFilter;
    // The store is only present if the manager has a document to maintain in sync
    this.manager.store = document ? this.$store : null;

    // To know when a filter is expired after an any update attempt
    this.manager.onExpiredCB = () => { this.$emit('expired') }

    this.docReady = true;

    this.$nextTick(() => {
      this.$emit('mount_ready')
    })
  }

  onSortField ({ field, sort_index }) {
    void this.manager.addFieldAtSortIndex(field, sort_index)
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

  // Avoiding overflow of update calls
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  updateDocument: (changes:{[key:string]:any}, manager) => void = throttle(
    (changes, manager) => {
      manager.update(changes)
    },
    this.debounce,
    { leading: false }
  );

  /**
   * @return The id assigned to the document
   */
  async saveAsNew ():string {
    // Letting the manager to know the store so it can save and update anything
    this.manager.store = this.$store;
    await this.manager.saveAsNew()

    // Returning a copy
    return this.manager.getCleanCopy()
  }

  // Used when an external window request the fields
  getFields () {
    return this.fields.concat()
  }

  async onDownload () {
    this.downloading = true
    await this.$store.dispatch('download', { id: this.manager.id, name: this.manager.name, auth: this.downloadAuth })
    this.downloading = false
  }

  onPrint () {
    window.print()
  }
}
</script>
<style lang="scss" scoped>
.document-container {
  background-color: #eeeeee;
  height: 100vh;
  .add-a-field {
    margin-left: -1rem;
  }
  h1 {
    max-width: 21.5cm;
    margin: 0.5rem auto 1rem auto;
  }
  .page {
    background-color: white;
    max-width: 21.5cm;
    margin: 0 auto;
    padding: 1.5cm;
    border-radius: 1px;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.1);
  }
  .view-buttons-container {
    width: 12rem;
    right: -9rem;
    transition: right 0.5s;
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
  }
  .view-buttons-container:hover {
    right: 0;
  }
  hr {
    width: 100%;
    color: #cccccc;
    border: none;
    border-top: 1px solid #cccccc;
    height: 0px;
  }
  @media print {
    .view-buttons-container {
      display: none;
    }
    .page {
      background-color: white;
      max-width: none;
      margin: 0 auto;
      padding: 0;
      border-radius: 0;
      box-shadow: none;
    }
  }
}
</style>
