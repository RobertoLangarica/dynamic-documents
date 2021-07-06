<template>
  <div v-show="show" class="dd-field-container col-12" :class="((isOver==field.id && isInEditView)?'field_hover ':' ')+'col-md-'+widthSize+(isGroup?'':' q-px-sm')" @mouseover="showEditMenu" @mouseleave="hideEditMenu">
    <div class="dd-field-controls q-pt-md" :class="{hide_action:isOver!=field.id}" v-if="isInEditView">
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    </div>
    <q-input v-if="isInEditView && !isGroup && field.type.component != 'input-paragraph'" v-model="name" label="" color="dd-label" :borderless="true" class="floating-label" :class="{'floating-label-mapper' : (typeof $refs[`${field.id}`] != `undefined`)}"></q-input>
    <div class="dd-field-content">
      <div class="row justify-end" v-if="showReplicateButton"><q-btn icon="control_point_duplicate" round size="sm" color="grey-6" @click="onReplicate" /></div>
      <component
        v-model="value"
        :is="getComponent(field.type)"
        :class="`dd-field dd-${field.type.component}`"
        :hint="!isInPrintView ? field.hint : null"
        :label="isInEditView?'':name"
        :readonly="isReadOnly"
        :group="field.id"
        :fields="fields"
        :field="field"
        :edit_view="isInEditView"
        :capture_view="isInCaptureView"
        :print_view="isInPrintView"
        :allowAutoCapture="allowAutoCapture"
        :manager="manager"
        stack-label
        align="left"
      >
        <template v-slot:prepend>
          <field-fillmap :ref="field.id" v-if="showFillmapMapper" :manager="manager" :field_id="field.id" :doc_type="manager.id" />
          <btn-autocapture v-if="showGroupAutocapture" :manager="manager" :group_id="field.id" label="Auto capturar grupo" />
          <div class="row justify-end" v-if="showDeleteReplication"><q-btn icon="delete" round size="sm" color="grey-6" @click="onDelete" /></div>
        </template>
      </component>
    </div>
    <div v-if="isInEditView" class="q-pt-md dd-field-config column items-start justify-start" :class="{hide_action:isOver!=field.id}">
      <q-btn icon="more_vert" flat round size="md" dense color="grey">
        <q-menu anchor="top right" self="bottom right">
          <q-list class="edit-item">
            <q-item clickable @click.native="ToggleShowInCapture">
              <q-item-section>
                <q-btn align="left" flat dense :ripple="false" icon="keyboard" label="Mostrar en captura" class="full-width edit-menu">
                  <q-icon name="keyboard" :class="'icon-check'+(show_in_capture?' active':'')" />
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item clickable @click.native="ToggleShowInPrint">
              <q-item-section>
                <q-btn align="left" flat dense :ripple="false" icon="description" label="Mostrar en impresión" class="full-width edit-menu">
                  <q-icon name="description" :class="'icon-check'+(show_in_print?' active':'')" />
                </q-btn>
              </q-item-section>
            </q-item>
            <q-item v-if="(typeof $refs[`${field.id}`] != `undefined`)" clickable v-close-popup @click.native="$refs[`${field.id}`].onClick()">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="bolt" label="Pre captura" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.native="showAddFieldDialog">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="vertical_align_top" label="Agregar antes" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.native="showAddFieldDialog">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="vertical_align_bottom" label="Agregar después" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.native="onShowConfigDiaog">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="settings" label="Configurar" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.native="onCopy">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="content_copy" label="Duplicar" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click.native="onDelete">
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="delete" label="Eliminar" class="full-width edit-menu" /></q-item-section>
            </q-item>
            <q-item clickable>
              <q-item-section><q-btn align="left" flat dense :ripple="false" icon="settings_ethernet" label="Ancho" class="full-width edit-menu" /></q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>

              <q-menu anchor="top end" self="top start">
                <q-list class="edit-item">
                  <q-item clickable @click.native="SetFieldSize('12')">
                    <q-item-section>
                      <q-btn align="left" flat dense :ripple="false" icon="radio_button_unchecked" label="100%" class="full-width edit-menu">
                        <q-icon name="radio_button_checked" :class="'icon-check'+(widthSize === '12'?' active':'')" />
                      </q-btn>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click.native="SetFieldSize('8')">
                    <q-item-section>
                      <q-btn align="left" flat dense :ripple="false" icon="radio_button_unchecked" label="66%" class="full-width edit-menu">
                        <q-icon name="radio_button_checked" :class="'icon-check'+(widthSize === '8'?' active':'')" />
                      </q-btn>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click.native="SetFieldSize('6')">
                    <q-item-section>
                      <q-btn align="left" flat dense :ripple="false" icon="radio_button_unchecked" label="50%" class="full-width edit-menu">
                        <q-icon name="radio_button_checked" :class="'icon-check'+(widthSize === '6'?' active':'')" />
                      </q-btn>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click.native="SetFieldSize('4')">
                    <q-item-section>
                      <q-btn align="left" flat dense :ripple="false" icon="radio_button_unchecked" label="33%" class="full-width edit-menu">
                        <q-icon name="radio_button_checked" :class="'icon-check'+(widthSize === '4'?' active':'')" />
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <template v-if="isInCaptureView && allowAutoCapture">
      <btn-autocapture :manager="manager" :field_id="field.id" />
    </template>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import FieldConfigDialog from "src/components/dd/FieldConfig/FieldConfigDialog.vue";
import draggable from 'vuedraggable'
import FieldTypeSelectionDialog from "./FieldTypeSelection/FieldTypeSelectionDialog.vue";
import FieldFillmap from './Fillmap/FieldFillmap.vue'
import BtnAutocapture from './Fillmap/BtnAutocapture.vue'
import { DocumentEditionManager } from "src/dynamic-documents/src/DocumentEditionManager";
import { mapGetters } from 'vuex'

@Component({
  components: { FieldConfigDialog, draggable, FieldFillmap, BtnAutocapture },
  computed: { ...mapGetters({ isOver: 'HoveredElement' }) }
})
export default class FieldComponent extends Vue {
  @Prop({ required: true }) readonly field!: DDField;
  @Prop({ type: Array, required: true }) readonly fields!: DDField[];
  @Prop({ type: Boolean, required: true }) readonly isInEditView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInCaptureView!: boolean;
  @Prop({ type: Boolean, required: true }) readonly isInPrintView!: boolean;
  @Prop({ type: Boolean, required: false, default: true }) readonly allowAutoCapture!:boolean;
  @Prop({ required: false, default: () => null }) readonly manager!:DocumentEditionManager;
  @Prop({ type: Number, required: false, default: 500 }) readonly debounce!: number;

  showEditMenu (event) {
    if (this.$store.state.hoveredElement != this.field.id) {
      this.$store.dispatch('changeHoveredElement', this.field.id)
    }
    event.stopPropagation()
    event.preventDefault()
  }

  hideEditMenu () {
    this.$store.dispatch('changeHoveredElement', null)
  }

  initialName: string = "";
  widthSize: string = "";
  ignoreNextNameChange: boolean = false
  mounted () {
    this.initialName = this.field.name;
    this.widthSize = this.field.size;
  }

  @Watch('field.name')
  onNameChanged (value, old) {
    if (!this.ignoreNextNameChange) {
      this.initialName = value
    }
    this.ignoreNextNameChange = false
  }

  @Watch('field.size')
  onSizeChanged (value, old) {
    this.widthSize = value
  }

  get showDeleteReplication () {
    return this.isInCaptureView && this.field.replicate_with
  }

  get showReplicateButton () {
    return this.isInCaptureView && this.field.replication ? this.field.replication.allow : false
  }

  get showGroupAutocapture () {
    return this.isGroup && this.allowAutoCapture && this.isInCaptureView
  }

  get showFillmapMapper () {
    return !this.isGroup && this.allowAutoCapture && this.isInEditView
  }

  get isGroup () {
    return DDField.isGroup(this.field)
  }

  get show () {
    return (this.isInEditView && this.field.show_in_edition) || (this.isInCaptureView && this.field.show_in_capture) || (this.isInPrintView && this.field.show_in_print)
  }

  get isReadOnly () {
    return this.isInPrintView || (this.isInCaptureView && (this.field.readonly || this.block_capture));
  }

  get block_capture () {
    return this.field.type.parameters.block_capture || false
  }

  get name () {
    return this.field.name;
  }

  set name (value) {
    this.field.name = value;
    this.ignoreNextNameChange = true
    this.notifyUpdate({ id: this.field.id, name: value } as DDField); // Sending only the data that changed
  }

  get value () {
    return this.field.value;
  }

  set value (value) {
    this.field.value = value;
    this.notifyUpdate({ id: this.field.id, value: value } as DDField); // Sending only the data that changed
  }

  get show_in_capture () {
    return this.field.show_in_capture;
  }

  set show_in_capture (show_in_capture) {
    this.field.show_in_capture = show_in_capture;
    this.notifyUpdate({ id: this.field.id, show_in_capture: show_in_capture } as DDField); // Sending only the data that changed
  }

  get show_in_print () {
    return this.field.show_in_print;
  }

  set show_in_print (show_in_print) {
    this.field.show_in_print = show_in_print;
    this.notifyUpdate({ id: this.field.id, show_in_print: show_in_print } as DDField); // Sending only the data that changed
  }

  get field_size () {
    return this.field.size;
  }

  set field_size (field_size) {
    this.field.size = field_size;
    this.notifyUpdate({ id: this.field.id, size: field_size } as DDField); // Sending only the data that changed
  }

  getComponent (fieldType: DDFieldType) {
    return DDFieldType.getUIComponentName(fieldType)
  }

  onDelete () {
    this.$root.$emit("f-delete", this.field);
  }

  notifyUpdate (field: DDField) {
    this.$root.$emit("f-update", field);
  }

  showAddFieldDialog () {
    this.$q
      .dialog({
        component: FieldTypeSelectionDialog,
        parent: this,
        text: "something"
      })
      .onOk((type) => {
        this.onFieldTypeSelected(type as DDFieldType);
      });
  }

  onShowConfigDiaog () {
    this.$q.dialog({
      component: FieldConfigDialog,
      parent: this,
      field: this.field
    });
  }

  onFieldTypeSelected (type: DDFieldType) {
    let field = DDField.createFromType(type);
    // All the new fields are group brothers
    field.group_by = this.field.group_by;
    this.$root.$emit("f-add_under_sort_index", {
      field: field,
      index: this.field.sort_index
    });
  }

  onReplicate () {
    this.$root.$emit("f-replicate", this.field.id)
  }

  onCopy () {
    this.$root.$emit("f-copy", this.field.id)
  }

  ToggleShowInCapture () {
    this.show_in_capture = !this.show_in_capture
  }

  ToggleShowInPrint () {
    this.show_in_print = !this.show_in_print
  }

  SetFieldSize (field_size) {
    this.field_size = field_size
  }
}
</script>

<style lang="scss">

.drop-zone{
    border-radius: 0.25rem;
    background-color: #31CCEC;
}
.drop-zone:empty{
    background-color: transparent;
}

.drop-container{
    border: 1px dotted grey;
    border-radius: 0.25rem;
}
.dd-input-paragraph .q-field__control:before{
    border: 0px;
    outline:none;
}
.dd-input-paragraph .q-field__control:after{
    border-width: 0px !important;
    border: 0px solid transparent;
    outline:none;
}
.dd-field-container.field_hover{
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}
.text-dd-label {
  color: grey;
}
.bg-dd-label {
  background: transparent;
}
.floating-label {
  position: absolute;
  z-index: 1000;
  top: -10px;
  left: 2.6rem;
}
.floating-label-mapper {
  left: 5.5rem;
}
.hide_action{
  opacity: 0 !important;
}
.edit-menu{
  font-family: "Roboto", "-apple-system", "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  text-transform: none;
  font-weight: normal;
  color: #000000;
  background-color: transparent !important;
  transition: unset !important;
  .q-focus-helper {
    visibility: hidden;
  }
}
.edit-item {
  .q-item{
    min-height: 0px;
    padding: 0px;
    padding-right: 8px;
  }
}
.icon-check {
  position: absolute;
  color: #447DBC;
  opacity: 0;
}
.icon-check.active {
  opacity: 1;
}
</style>
