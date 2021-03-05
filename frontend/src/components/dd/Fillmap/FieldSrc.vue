<template>
  <div class="dd-field-content dd-edit-view q-mb-md">
    <q-badge class="dd-field-name" color="grey-8">
      {{ field.name }}
    </q-badge>

    <field-group-component v-if="isGroup"
                           class="dd-field dd-field-group col-8"
                           :fields="fields"
                           :group="field.id"
                           :fillmap_view_src="true"
                           @drag_fill="(data)=>{$emit('drag_fill',data)}"
    />
    <draggable v-else
               :list="fields"
               :sort="false"
               :group="{name: 'field', pull:'clone', put:false}"
               handle=".map-handle"
               dragClass="dragging"
               @remove="onRemove"
    >
      <div class="row items-center">
        <div class="col-12 only_on_drag">
          <!-- Only visible while dragging -->
          <q-badge class="dd-field-name" color="grey-8" :label="field.name" />
        </div>
        <q-input class="col q-ml-sm" dense :value="field.value" :readonly="true" disabled />
        <div><q-btn icon="drag_indicator" flat round size="md" dense class="cursor-drag map-handle" color="grey" /></div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { DDField } from 'src/dynamic-documents/src/core/DDField';

export default {
  components: {
    draggable
  },
  props: {
    field: { type: Object, required: true },
    fields: { type: Array, required: true }
  },
  data () {
    return {}
  },
  computed: {
    isGroup () {
      return DDField.isGroup(this.field)
    }
  },
  methods: {
    onRemove (evt) {
      let from = this.field.id
      // @ts-ignore
      let to = evt.to[Object.keys(evt.to).find(k => k.includes('Sortable'))].options.field_id
      this.$emit('drag_fill', { from, to })
    }
  }
}
</script>

<style lang="scss" scoped>
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

.dragging{
    background-color: transparent;
}
.only_on_drag {
    display: none;
}

.dragging .only_on_drag{
    display: inherit;
}

</style>
