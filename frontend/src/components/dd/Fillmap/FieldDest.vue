<template>
  <div class="dd-field-content dd-edit-view q-mb-md">
    <q-badge class="dd-field-name" color="grey-8">
      {{ field.name }}
    </q-badge>

    <field-group-component v-if="isGroup"
                           class="dd-field dd-field-group col-8"
                           :fields="fields"
                           :group="field.id"
                           :fillmap_view_dest="true"
                           @remove_fill="(data)=>{$emit('remove_fill',data)}"
    />
    <div v-else class="row">
      <div class="col-xs-4 col-md-3 col-lg-2 row" style="position:relative;">
        <div class="col-12 row drop-container" style="position:absolute; top:0; bottom:0;">
          <div v-if="map_name" class="full-width row justify-center items-center">
            <q-badge rounded multi-line>
              <q-btn icon="close" round color="grey" dense size="xs" class="q-ma-none q-mr-sm" @click="onRemoveFillmap" />
              {{ map_name }}
            </q-badge>
          </div>
        </div>
        <draggable
          :group="{name:'field', pull:false, put:true}"
          :sort="false"
          ghostClass="ghost"
          class="col-12 drop-zone row items-center justify-center"
          :field_id="field.id"
        />
      </div>
      <nq-input class="col q-ml-sm" dense :value="valueToShow" :readonly="true" />
    </div>
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
    fields: { type: Array, required: true },
    map_value: { required: false, default: () => undefined },
    map_name: { type: String, required: false, default: '' }
  },
  data () {
    return {}
  },
  computed: {
    isGroup () {
      return DDField.isGroup(this.field)
    },
    valueToShow () {
      return this.map_value !== undefined ? this.map_value : this.field.value
    }
  },
  methods: {
    onRemoveFillmap () {
      this.$emit('remove_fill', this.field.id)
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

</style>
