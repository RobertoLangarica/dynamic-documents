<template>
  <div class="embeded_container row items-center">
    <q-btn @click="onClick" icon="drag_indicator" flat round size="md" dense class="cursor-drag" color="grey" />
    <q-badge>{{ name }}</q-badge>
    <q-badge>{{ field_id }}</q-badge>
    <q-badge>{{ readonly }}</q-badge>
    <q-btn icon="settings" flat round size="md" dense class="cursor-drag" color="grey" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { DDTemplate } from 'src/dynamic-documents/src/core/DDTemplate'
import { DDDocument } from 'src/dynamic-documents/src/core/DDDocument';
import { DDField } from 'src/dynamic-documents/src/core/DDField';

@Component({})
export default class FieldEmbeddedComponent extends Vue {
  @Prop({ required: false }) readonly node!: Node;
  @Prop({ required: false }) readonly updateAttrs!:(any)=>any;
  @Prop({ required: false }) readonly view!;
  field:DDField | null = null

  get field_id ():string { return this.node.attrs.field_id }
  set field_id (value) { this.updateAttrs({ field_id: value }) }

  get name ():string { return this.field ? this.field.name : '' }

  onClick () {
    this.field_id = 'test';
  }

  get readonly () {
    return this.$parent.$attrs.readonly
  }

  mounted () {
    this.$root.$emit('get_field', { id: this.field_id, set: this.setField.bind(this) })
  }

  setField (field:DDField) {
    this.field = field
  }
}
</script>

<style scoped>
    .embeded_container {
        display: inline-block;

    }
</style>
