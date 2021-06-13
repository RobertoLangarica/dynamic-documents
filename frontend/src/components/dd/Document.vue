<template>
  <article class="document-container q-pa-md">
    <div class="row title-container" :class="{'justify-between':isInEditView,'justify-start':!isInEditView}" style="max-width:21.5cm;">
      <h1 class="col" v-if="docReady && !refreshing" :contenteditable="isInEditView" @input="e=>name=e.target.innerText">
        {{ initialName }}
      </h1>
      <template v-if="isInCaptureView && allowAutoCapture">
        <btn-autocapture :manager="manager" label="Auto capturar documento" />
      </template>
    </div>

    <!-- DOCUMENT -->
    <div v-if="docReady" class="dd-fields-container page" :class="{'dd-edit-view': isInEditView, 'dd-capture-view': isInCaptureView, 'dd-print-view': isInPrintView}">
      <field-group-component
        :fields="fields"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
        :allowAutoCapture="allowAutoCapture"
        :manager="manager"
      />
      <input-field-creation :autofocus="!fields.length"/>
    </div>

    <!-- MENU -->
    <template v-if="docReady">
      <div v-if="views.length > 0 || showDownload || (!isInPrintView && !creatingNewDocument)" class="fixed-top-right q-py-sm q-px-none bg-white column justify-end shadow-1 view-buttons-container">
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
        <q-btn v-if="!isTemplate"
               flat
               align="left"
               label="Links de captura"
               @click="onShowFilters"
               icon="link"
               color="grey-7" />
        <q-btn v-if="!isInPrintView && !creatingNewDocument"
               flat
               align="left"
               label="Guardar"
               @click="onSaveChanges"
               icon="save"
               :color="isDirty ? 'info' : 'grey-7'" />
        <q-btn v-if="!isInPrintView && creatingNewDocument"
               flat
               align="left"
               label="Crear"
               @click="saveAsNew"
               icon="save"
               :color="isDirty ? 'info' : 'grey-7'" />
      </div>
    </template>
    <q-inner-loading :showing="loading" />
  </article>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import IDDView from "src/dynamic-documents/src/core/IDDView";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import BtnAutocapture from './Fillmap/BtnAutocapture.vue'
import InputFieldCreation from './InputFieldCreation.vue'

@Component({ components: { BtnAutocapture, InputFieldCreation } })
export default class Document extends Vue {
  @Prop({ type: String, required: false, default: '' }) readonly id!: string;
  @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) readonly isFilter!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) readonly allowDownload!:boolean;
  @Prop({ type: Boolean, required: false, default: true }) readonly allowAutoCapture!:boolean;
  @Prop({ type: String, required: false, default: '' }) readonly downloadAuthorization!:string;
  @Prop({
    type: Array,
    required: false,
    default: () => [
      { label: "Editar", value: IDDView.EDIT },
      { label: "Capturar", value: IDDView.CAPTURE },
      { label: "Ver", value: IDDView.PRINT }
    ]
  }) readonly views!:any[];

  @Prop({ type: Number, required: false, default: 0 }) readonly initialView!:number;

  currentView: IDDView = this.initialView
  manager: DocumentEditionManager = {} as any;
  fields: DDField[] = [];
  docReady:boolean = false;
  refreshing:boolean = false;
  busy:boolean = false;
  creatingNewDocument:boolean = false
  initialName: string = "";

  @Watch('views', { immediate: true })
  onAllowedViewschanged (value:any[], old:any[]) {
    if (!value.find(v => v.value === this.currentView)) {
      // Selecting an allowed view
      this.currentView = value.length ? value[0].value : IDDView.PRINT
    }
  }

  get loading () {
    return this.busy || this.refreshing
  }

  get isDirty () {
    return this.manager.isDirty
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
    this.updateDocument({ name: value })// Sending only the data that changed
  }

  beforeMount () {
    void this.$store.dispatch("getTransformations");
    void this.$store.dispatch("getTypes");

    this.$root.$on("f-add", this.onFieldAdded.bind(this));
    this.$root.$on("f-update", this.onFieldUpdated.bind(this));
    this.$root.$on("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$on("f-sort_field", this.onSortField.bind(this));
    this.$root.$on("f-add_under_sort_index", this.onFieldInserted.bind(this));
    this.$root.$on("f-copy", this.onCopyField.bind(this));
    this.$root.$on("f-replicate", this.onReplicateField.bind(this));
    console.log('Added listeners')
  }

  beforeDestroy () {
    this.$root.$off("f-add");
    this.$root.$off("f-update");
    this.$root.$off("f-delete");
    this.$root.$off("f-sort_field");
    this.$root.$off("f-add_under_sort_index");
    this.$root.$off("f-copy");
    this.$root.$off("f-replicate");
  }

  async loadDocument () {
    let document
    if (!this.id) {
      // empty doc
      return null
    }

    let action = this.isTemplate ? 'getTemplate' : this.isFilter ? 'filtered_docs/getFilteredDocument' : 'getDocument'
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
    let document = await this.loadDocument()
    this.$emit('loaded_document', document)

    this.manager = document ? DocumentEditionManager.createFromRemoteObject(document) : new DocumentEditionManager();
    if (!document) {
      // Placeholder name
      this.manager.name = (this.isTemplate ? 'Plantilla' : 'Documento') + ' sin nombre'
      this.manager.is_template = this.isTemplate
      this.creatingNewDocument = true
    } else if (this.allowAutoCapture) {
      // Getting the fillmaps ready (needed by the nested fields)
      await this.$store.dispatch('fillmaps/getByDoc', this.id)
    }

    this.initialName = this.manager.name;

    this.fields = this.manager.fields;
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

  updateDocument (changes:{[key:string]:any}) {
    this.manager.updateDocument(changes)
  }

  async onSaveChanges () {
    this.$root.$emit('send_message', { message: 'saving', data: { name: this.manager.name } })
    this.busy = true
    let successfull = await this.manager.saveChanges()
    this.busy = false

    if (successfull) {
      this.$root.$emit('send_message', { message: 'saved' })
    } else {
      this.$root.$emit('send_message', { message: 'saved_error' })
      // @ts-ignore
      if (!this.$root.invisibleDialogs) {
        this.$q.notify({ message: 'Error al guardar', color: 'negative' })
      }
    }
  }

  /**
   * @return A copy of the created document
   */
  async saveAsNew () {
    // Letting the manager to know the store so it can save and update anything
    this.$root.$emit('send_message', { message: 'creating' })
    this.manager.store = this.$store;
    let result:{[key:string]:any} = await this.manager.saveAsNew()

    if (result.success) {
      this.$root.$emit('send_message', { message: 'created', data: result.data })
    } else {
      this.$root.$emit('send_message', { message: 'creation_error' })
    }
  }

  async refreshDocument () {
    this.refreshing = true
    await this.manager.refreshDocument()
    await this.$nextTick()
    this.initialName = this.manager.name;
    this.fields = this.manager.fields;
    this.refreshing = false
  }

  // Used when an external window request the fields
  getFields () {
    return this.fields.concat()
  }

  async onDownload () {
    this.busy = true
    await this.$store.dispatch('download', { id: this.manager.id, name: this.manager.name, auth: this.downloadAuthorization })
    this.busy = false
  }

  onShowFilters () {
    this.$root.$emit('send_message', { message: 'show_filters' })
  }

  onPrint () {
    window.print()
  }

  async onCopyField (field_id:string) {
    this.busy = true
    let success = await this.manager.copyField(field_id)
    if (!success) {
      this.$q.notify({ message: 'Ups! ocurrió un error', color: 'negative' })
    }
    this.busy = false
  }

  async onReplicateField (field_id:string) {
    this.busy = true
    let success = await this.manager.replicateField(field_id)
    if (!success) {
      this.$q.notify({ message: 'Ups! ocurrió un error', color: 'negative' })
    }
    this.busy = false
  }
}
</script>
<style lang="scss" scoped>
.document-container {
  background-color: #eeeeee;
  min-height: 100vh;
  height: auto;
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
    width: 14rem;
    right: -11rem;
    transition: right 0.5s;
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
    margin-top: 4.5rem;
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

.title-container{
  max-width: 21.5cm;
  margin: 0 auto;
}
</style>
