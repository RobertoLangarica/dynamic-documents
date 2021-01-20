<template>
  <article class="q-pa-md">
    <h1 v-if="docReady" :contenteditable="isInEditView"
        @input="e=>name=e.target.innerText">
      {{ initialName }}
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
    <template v-if="changesAllowed">
      <div class="fixed-top-right bg-white q-pa-sm q-mr-md">
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

  async beforeMount () {
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
    if (this.id !== '') {
      let action = this.isTemplate ? 'getTemplate' : 'getDocument'
      document = await this.$store.dispatch(action, this.id);
      if (document.status === 'closed' || document.status === 'prevent_changes') {
        this.changesAllowed = false
      }
    } else {
      // This is an empty documents
    }

    this.manager = document ? DocumentEditionManager.createFromRemoteObject(document) : new DocumentEditionManager();
    if (!document) {
      // Placeholder name
      this.manager.name = (this.isTemplate ? 'Plantilla' : 'Documento') + ' sin nombre'
    }

    this.initialName = this.manager.name;

    this.fields = this.manager.fields;
    this.manager.isTemplate = this.isTemplate;
    this.manager.isDocument = !this.isTemplate;
    // The store syncs an existing doc
    this.manager.store = document ? this.$store : null;

    this.docReady = true;

    if (this.forceViewOnly) {
      this.changesAllowed = false
    }
  }

  onSortedFields (sorted: DDField[]) {
    console.log('FIRST update')
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
