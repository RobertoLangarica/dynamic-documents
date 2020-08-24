<template>
  <div class="embeded_container row items-center">
    <template v-if="!readonly">
      <q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
      <q-badge>{{ name }}</q-badge>
      <q-btn icon="settings" flat round size="md" dense class="cursor-drag" color="grey" />
    </template>
    <span v-else-if="!isHTML">{{ value }}</span>
    <span v-else v-html="value" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DDTemplate } from 'src/dynamic-documents/src/core/DDTemplate'
import { DDDocument } from 'src/dynamic-documents/src/core/DDDocument';
import { DDField } from 'src/dynamic-documents/src/core/DDField';
import { EFieldComponentID } from 'src/dynamic-documents/src/core/DDFieldType';

@Component({})
export default class FieldEmbeddedComponent extends Vue {
  @Prop({ required: false }) readonly node!: Node;
  @Prop({ required: false }) readonly updateAttrs!:(any)=>any;
  @Prop({ required: false }) readonly view!;
  // field:DDField | null = null

  get field_id ():string { return this.node.attrs.field_id }
  set field_id (value) { this.updateAttrs({ field_id: value }) }

  get name ():string { return this.field ? this.field.name : '' }
  get value () { return this.field ? this.field.value : '' }
  get isHTML () { return this.field?.type.component === EFieldComponentID.INPUT_PARAGRAPH || false }

  onClick () {
    this.field_id = 'test';
  }

  get readonly () {
    return this.$parent.$attrs.readonly
  }

  get field ():DDField {
    return this.$parent.$attrs.fields.find(f => f.id === this.field_id) as DDField
  }
}
</script>

<style scoped>
    .embeded_container {
        display: inline-block;

    }
</style>
