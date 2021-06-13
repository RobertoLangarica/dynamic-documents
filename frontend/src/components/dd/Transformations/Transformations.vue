<template>
  <div>
    <q-select
      label=""
      dense
      options-dense
      :options="transformOptions"
      :value="selected"
      multiple
      map-options
      emit-value
      display-value="Transformaciones"
      @input="onSelected"
    >
      <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
        <q-item
          v-bind="itemProps"
          v-on="itemEvents"
        >
          <q-item-section>
            <q-item-label v-html="opt.label" />
          </q-item-section>
          <q-item-section side>
            <q-checkbox :value="selected" @input="toggleOption(opt)" />
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <div class="q-my-md q-pa-sm transforms">
      <div v-if="!selected.length" class="empty">
        <h6>No hay transformaciones aplicadas</h6>
      </div>
      <draggable class="row q-gutter-sm" v-model="selected" handle=".cursor-drag" :animation="200">
        <q-badge v-for="item in selected" :key="item.id" class="col-auto transformation">
          <q-btn icon="drag_indicator" flat round size="xs" class="cursor-drag" color="grey" />
          <span>{{ $t(`transformations.${item.name}_short`) }}</span>
          <div v-if="item.parameters.allow_input" class="input q-mx-sm">
            (<span
              contenteditable="true"
              @focusout="e=>item.parameters.input=e.target.innerText">{{ item.parameters.input }}</span>)
          </div>
          <q-btn icon="close" round size="xs" dense class="q-mx-xs" color="grey" @click="deselect(item.id)" />
        </q-badge>
      </draggable>
    </div>

    <div>
      <div><strong class="q-mr-sm">Original:</strong>{{ valueToTransform }}</div>
      <div><strong class="q-mr-sm">Transformado:</strong> <span v-if="selected.length">{{ transformedValue }}</span></div>
    </div>
  </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import Transforms, { separator as transform_separator } from 'src/transformations'
import { mixins } from "vue-class-component";
import EmbedMixin from "src/pages/embeds/EmbedMixin";

@Component({ components: { draggable } })
export default class Transformations extends mixins(EmbedMixin) {
    @Prop({ required: false }) value!: any;
    @Prop({ required: false, default: () => [] }) readonly initial_options!: any[];
    @Prop({ required: false, default: () => [] }) readonly options!: any[];

    selected:any[] = []
    transformations:any[] = []
    valueToTransform:any|null = null
    transformOptions:any[] = []
    initialTransforms:any[] = []

    mounted () {
      this.valueToTransform = this.value
      this.setTransformOptions(this.options)
      this.initialTransforms = this.initial_options.concat()
    }

    setTransformOptions (options) {
      this.transformOptions = options.map(t => Object.assign({}, this.deepTransformCopy(t), { label: this.$t(`transformations.${t.name}`) }))
    }

    onMessage (message, data, handled = false) {
      switch (message) {
        case 'set_data':
          handled = true
          this.valueToTransform = data.value
          this.setTransformOptions(data.options)
          this.initialTransforms = data.initial_options.concat()
          break;
        case 'get_transforms':
          handled = true
          this.sendMessage('transformations', this.getSelectedTransformationsAsString())
          break;
        default:
          if (!handled) {
            console.log(`Unrecognized event->${message}`)
          }
      }
    }

    @Watch('initialTransforms')
    onExistingChange (initial_options) {
      if (!initial_options) {
        return
      }
      this.setSelectedTransformations()
    }

    @Watch('transformOptions')
    onAvailableChange (options) {
      if (!options) {
        return
      }

      this.transformations = options.map(t => {
        return Object.assign(
          {},
          {
            label: this.$t(`transformations.${t.name}`),
            value: t
          })
      })

      this.setSelectedTransformations()
    }

    onSelected (value) {
      // We want copies of the model instead of references
      this.selected = value.map(this.deepTransformCopy)
    }

    deselect (id) {
      let index = this.selected.findIndex(s => s.id === id)
      if (index >= 0) {
        this.selected.splice(index, 1)
      }
    }

    setSelectedTransformations () {
      this.selected = []
      this.initialTransforms.forEach(s => {
        let splitted = s.split(':')
        let name = splitted[0]
        let tr = this.transformations.find(t => t.value.name === name);
        if (tr) {
          let parameters = splitted.length > 1 ? { input: splitted[1] } : {}
          parameters = Object.assign({}, tr.value.parameters, parameters)
          this.selected.push(Object.assign({}, tr.value, { parameters: parameters }))
        }
      })
    }

    getSelectedTransformationsAsString () {
      return this.selected.map(t => {
        let name
        if (t.parameters.input) {
          name = `${t.name}:${t.parameters.input}`
        } else {
          name = t.name
        }
        return name
      }).join(transform_separator)
    }

    get transformedValue () {
      if (!this.valueToTransform) {
        return ''
      }

      return Transforms.apply(this.selected, this.valueToTransform)
    }

    deepTransformCopy (target) {
      let result = Object.assign({}, target)
      Object.keys(result).forEach(key => {
        if (typeof result[key] === 'object') {
          result[key] = Object.assign({}, result[key])
        }
      })

      return result
    }
}
</script>

<style lang="scss" scoped>
    .transforms{
        border: 1px dashed grey;
        border-radius: 4px;
        min-height: 4rem;
    }
    .empty{
        height: 4rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: grey;

        h6{
            margin: 0px;
        }
    }
    .transformation{
        .input{
            color: white;
            background-color: #343463;
        }
    }
</style>
