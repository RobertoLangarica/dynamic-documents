<template>
  <div>
    <!-- <draggable v-model="myFields" handle=".cursor-drag" @start="drag=true" @end="drag=false"> -->
    <field-component
      v-for="field in myFields"
      :key="field.id"
      :field="field"
      :fields="fields"
      :isInEditView="edit_view"
      :isInCaptureView="capture_view"
      :isInPrintView="print_view"
      @onShowAddFieldDialog="showAddFieldDialog"
    />
    <!-- Prueba sin filtrar campos -->
    <p v-for="item in fields" :key="item.id + 'a'">
      {{ item.name }}
    </p>

    <!-- </draggable> -->
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
    <div />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

import draggable from "vuedraggable";
import FieldTypeDialog from "components/FieldTypeDialog.vue";
import FieldComponent from "components/FieldComponent.vue";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";

@Component({ components: { draggable, 'field-type-dialog': FieldTypeDialog, 'field-component': FieldComponent } })
export default class FieldGroupComponent extends Vue {
@Prop({ required: false, default: '' }) readonly group!:string
@Prop({ required: true }) readonly fields!:DDField[]
@Prop({ required: false, default: true }) readonly edit_view!:boolean ;
@Prop({ required: false, default: false }) readonly capture_view!:boolean ;
@Prop({ required: false, default: false }) readonly print_view!:boolean ;

drag:boolean = false

get myFields () {
  console.log('GROUP', this.group)
  if (this.group === '') {
    // Without group
    return this.fields.filter(v => v.group_by === '' || !v.group_by)
  }

  // TODO filtrar por campo
  return this.fields
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
      this.onFieldTypeSelected(type as DDFieldType)
    });
}

onFieldTypeSelected (type:DDFieldType) {
  let field = DDField.createFromType(type)
  field.group_by = this.group
  this.$emit('f-add', field)
}
}
</script>
