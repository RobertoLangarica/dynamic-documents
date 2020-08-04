<template>
  <div class="row q-col-gutter-md">
    <h2 class="col-12">
      {{ name }}
    </h2>

    <field-type-selector
      class="col-12  q-mb-lg"
      @selected="onTypeSelected"
    />

    <basic-field
      v-for="item in fields"
      :key="item.id"
      class="col-12"
      :field="item"
      :all_fields="manager.fields"
      @f-updated="onFieldUpdated"
      @f-deleted="onFieldDeleted"
      @f-added="onFieldAdded"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { DocumentEditionManager } from '../src/DocumentEditionManager'
import { DDFieldType } from '../src/core/DDFieldType'
import { DDField } from '../src/core/DDField'

@Component({ name: 'document-editor' })
export default class DocumentEditorScreen extends Vue {
  @Prop({ required: false, default: false }) readonly captureMode!:boolean
  @Prop({ required: false, default: () => new DocumentEditionManager() }) readonly manager!:DocumentEditionManager

  mounted () {
    this.manager.store = this.$store
  }

  get name () { return this.manager.name }
  set name (value) { this.manager.name = value }

  get fields () { return this.manager.fields.filter(f => f.group_by === '') }

  onFieldUpdated (field:DDField) {
    this.manager.updateField(field)
  }

  onFieldDeleted (field:DDField) {
    this.manager.deleteField(field)
  }

  onFieldAdded (field:DDField) {
    this.manager.addField(field)
  }

  onTypeSelected (type: DDFieldType) {
    this.manager.addFieldFromType(type)
  }
}
</script>
