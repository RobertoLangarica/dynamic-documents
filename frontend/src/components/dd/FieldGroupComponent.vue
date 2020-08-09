<template>
  <div>
    <draggable v-model="myFields" handle=".cursor-drag"  @end="onDragEnded" :animation="200">
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
    return this.fields.filter(v => v.group_by === '' || !v.group_by)
  }

  return this.fields.filter(v => v.group_by === this.group)
}

set myFields (value){/*Empty on purpose*/}

onDragEnded(e){
  if(e.oldIndex === e.newIndex ) return;

  let a = e.oldIndex < e.newIndex ? e.oldIndex:e.newIndex
  let b = e.oldIndex > e.newIndex ? e.oldIndex:e.newIndex
  let toUpdate:DDField[] = []

  for(let i = a; i <= b; i++){
    toUpdate.push(this.myFields[i])
    if(e.newIndex < e.oldIndex){
      // The fields go down
      if(i == b){
        this.myFields[i].sort_index = this.myFields[e.newIndex].sort_index-1
      } else {
        this.myFields[i].sort_index += 1;
      }
    } else{
      // The fields go up
      if(i == a ){
        this.myFields[i].sort_index = this.myFields[b].sort_index
      } else {
        this.myFields[i].sort_index -= 1;
      }
    }
  }

  this.$root.$emit('f-sort_fields',toUpdate)
}

showAddFieldDialog () {
  this.$q
    .dialog({
      component: FieldTypeDialog,
      parent: this,
      text: "something"
    })
    .onOk((type) => {
      this.onFieldTypeSelected(type as DDFieldType)
    });
}

onFieldTypeSelected (type:DDFieldType) {
  let field = DDField.createFromType(type)
  // All the children are part of this group
  field.group_by = this.group
  this.$root.$emit('f-add', field)
}
}
</script>
