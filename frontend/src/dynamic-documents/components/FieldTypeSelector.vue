<template>
    <nq-select v-model="type"
        option-label="name"
        option-value="name"
        :options="$store.state.dd.types"
        dropdown-icon="add_circle"
        @input="onInput"
       >
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
          >
            <q-item-section>
              <q-item-label v-html="scope.opt.name" />
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item>
            {{label}}
        </template>
    </nq-select>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: false,
      default: 'Agregar campo nuevo'
    }
  },
  data () {
    return {
      type: {}
    }
  },
  methods: {
    onInput (selected) {
      this.$emit('selected', selected)
      this.type = {}
    }
  }
}
</script>
