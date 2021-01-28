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

    <template v-if="docReady && changesAllowed">
      <div class="fixed-top-right q-pa-sm q-mr-md">
        <q-radio
          v-for="view in views"
          :key="view.value"
          v-model="currentView"
          :val="view.value"
          :label="view.label"
        />
      </div>
    </template>
  </article>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { throttle } from "underscore/modules/index";

export enum IViews {
  EDIT,
  CAPTURE,
  PRINT,
}

@Component({})
export default class Document extends Vue {
  @Prop({ type: String, required: false, default: '' }) readonly id!: string;
  @Prop({ type: Boolean, required: false, default: false }) readonly isTemplate!: boolean;
  @Prop({ type: Boolean, required: false, default: false }) readonly isFilter!: boolean;
  @Prop({ type: Number, required: false, default: 500 }) readonly debounce!: number;
  @Prop({ type: Boolean, required: false, default: false }) readonly forceViewOnly:boolean

  currentView: IViews = IViews.EDIT;
  manager: DocumentEditionManager = {} as any;
  fields: DDField[] = [];
  docReady = false;
  initialName: string = "";
  changesAllowed:boolean = !this.forceViewOnly

  views = [
    { label: "Editar", value: IViews.EDIT },
    { label: "Capturar", value: IViews.CAPTURE },
    { label: "Ver", value: IViews.PRINT }
  ];

  get isInEditView () {
    if (!this.changesAllowed) {
      return false
    }
    return this.currentView === IViews.EDIT;
  }

  get isInCaptureView () {
    if (!this.changesAllowed) {
      return false
    }
    return this.currentView === IViews.CAPTURE;
  }

  get isInPrintView () {
    if (!this.changesAllowed) {
      return true
    }
    return this.currentView === IViews.PRINT;
  }

  get name () {
    return this.manager ? this.manager.name : '';
  }

  set name (value) {
    this.manager.name = value;
    this.updateDocument({ name: value }, this.manager)// Sending only the data that changed
  }

  beforeDestroy () {
    this.$root.$off("f-add", this.onFieldAdded.bind(this));
    this.$root.$off("f-update", this.onFieldUpdated.bind(this));
    this.$root.$off("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$off("f-sort_fields", this.onSortedFields.bind(this));
    this.$root.$off("f-add_under_sort_index", this.onFieldInserted.bind(this));
  }

  beforeMount () {
    void this.$store.dispatch("getTransformations");
    void this.$store.dispatch("getTypes");
  }

  async mounted () {
    this.$root.$on("f-add", this.onFieldAdded.bind(this));
    this.$root.$on("f-update", this.onFieldUpdated.bind(this));
    this.$root.$on("f-delete", this.onFieldDeleted.bind(this));
    this.$root.$on("f-sort_fields", this.onSortedFields.bind(this));
    this.$root.$on("f-add_under_sort_index", this.onFieldInserted.bind(this));

    let document
    if (this.id !== '') {
      let action = this.isTemplate ? 'getTemplate' : this.isFilter ? 'doc_filters/getFilteredDocument' : 'getDocument'
      document = await this.$store.dispatch(action, this.id);
      if (document.status === 'closed' || document.status === 'prevent_changes') {
        this.changesAllowed = false
      }
      if(this.isFilter && document.success === false){
        // TODO maybe this screen could block any further edition
        if(!document.filter_expired){
          this.$emit('404')
        } else {
          this.$emit('expired')
        }
      }
    } else {
      // Empty doc
    }

    this.manager = document ? DocumentEditionManager.createFromRemoteObject(document) : new DocumentEditionManager();
    if (!document) {
      // Placeholder name
      this.manager.name = (this.isTemplate ? 'Plantilla' : 'Documento') + ' sin nombre'
    }
    this.initialName = this.manager.name;

    this.fields = this.manager.fields;
    this.manager.isTemplate = this.isTemplate;
    this.manager.isDocument = !this.isTemplate && !this.isFilter;
    this.manager.isFilter = this.isFilter;
    // The store is only present if the manager has a document to maintain in sync
    this.manager.store = document ? this.$store : null;
    // To know when a filter is expired
    this.manager.onExpiredCB=()=>{this.$emit('expired')}
    this.setAvailableStatus(document)

    this.docReady = true;

    if (this.forceViewOnly) {
      this.changesAllowed = false
    }
  }

  setAvailableStatus (document) {
    if(this.isFilter){
      this.views=[{ label: "Capturar", value: IViews.CAPTURE }]
      this.views.push({ label: "Ver", value: IViews.PRINT })
    } else if (document) {
      this.views = [{ label: "Ver", value: IViews.PRINT }]
      switch (document.status.name) {
        case 'only_capture':
          this.views.unshift({ label: "Capturar", value: IViews.CAPTURE })
          break
        case 'only_edition':
          this.views.unshift({ label: "Editar", value: IViews.EDIT })
          break;
        case 'open':
          this.views.unshift({ label: "Capturar", value: IViews.CAPTURE })
          this.views.unshift({ label: "Editar", value: IViews.EDIT })
          break;
      }
    }
    this.currentView = this.views[0].value
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
}
</script>
<style lang="scss">
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
}
</style>
