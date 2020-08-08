<template>
  <div>
    <draggable v-model="myFields" handle=".cursor-drag"  @start="onDragStart" @end="onDragEnded" :animation="200">
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
    <div />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";

import draggable from "vuedraggable";
import FieldTypeDialog from "components/FieldTypeDialog.vue";
import FieldComponent from "components/dd/FieldComponent.vue";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import { DDFieldType } from "src/dynamic-documents/src/core/DDFieldType";

@Component({name:'field-group-component', components: { draggable, 'field-type-dialog': FieldTypeDialog, 'field-component': FieldComponent } })
export default class FieldGroupComponent extends Vue {
@Prop({ required: false, default: '' }) readonly group!:string
@Prop({ required: true }) readonly fields!:DDField[]
@Prop({ required: false, default: true }) readonly edit_view!:boolean ;
@Prop({ required: false, default: false }) readonly capture_view!:boolean ;
@Prop({ required: false, default: false }) readonly print_view!:boolean ;

get myFields () {
  if (this.group === '') {
    // Without group
    // return this.fields.filter(v => v.group_by === '' || !v.group_by).sort((a,b)=>a.sort_index - b.sort_index)
    return this.fields.filter(v => v.group_by === '' || !v.group_by)
  }

  // return this.fields.filter(v => v.group_by === this.group).sort((a,b)=>a.sort_index - b.sort_index)
  return this.fields.filter(v => v.group_by === this.group)
}

set myFields (value){
  // console.log(value)
  console.log('end')
}

onDragStart(e){
  console.log(e)
}

onDragEnded(e){
  console.log(e.oldIndex)
  console.log(e.newIndex)

  // Index swap
  if(Math.abs(e.oldIndex - e.newIndex) === 1){
    // First time 
    if(this.myFields[e.oldIndex].sort_index === this.myFields[e.newIndex].sort_index){
        this.myFields[e.oldIndex].sort_index = e.newIndex
        this.myFields[e.newIndex].sort_index = e.oldIndex
    }
  }
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
  this.$root.$emit('f-add', field)
}
}
</script>
