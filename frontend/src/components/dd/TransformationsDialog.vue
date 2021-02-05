<template>
  <q-dialog ref="dialog" v-model="show" @before-show="onOpen" @before-hide="onClose">
    <q-card class="row justify-between" dense>
      <q-card-section class="col-12">
        <h6 class="q-ma-none">{{ title }}</h6>
        <q-option-group
          dense
          type="checkbox"
          :options="transformations"
          v-model="selectedTransformations"
        />
      </q-card-section>
      <q-separator />
      <q-card-section class="col-12">
        <draggable class="row q-gutter-sm" v-model="selectedTransformations" handle=".cursor-drag" :animation="200">
          <q-badge
            v-for="item in selectedTransformations" :key="item.id"
            class="col-xs-2 col-md-1"
          >
            <q-btn icon="drag_indicator" flat round size="xs" dense class="cursor-drag" color="grey" />
            <span>{{ item.name }}</span>
          </q-badge>
        </draggable>
      </q-card-section>
      <q-card-section class="col-12">
        <div>Valor: {{ field_value }}</div>
        <div>Resultado: {{ transformedValue }}</div>
      </q-card-section>

      <q-card-actions align="right" class="col-12">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onCancel" />
        <q-btn rounded color="primary" label="Aceptar" @click="onOk" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { Vue, Component, Prop } from 'vue-property-decorator'
import Transforms from 'src/transformations'

@Component({ components: { draggable } })
export default class TransformationsDialog extends Vue {
    @Prop({ required: true }) value!: boolean;
    @Prop({ required: true, default: '' }) field_value!: any;
    @Prop({ required: false, default: 'Transformaciones' }) readonly title!: string;
    @Prop({ required: false, default: () => [] }) readonly initial_transformations!: string[];

    selectedTransformations:any[] = []

    get transformations () {
      return this.$store.state.dd.transformations.map(t => {
        return Object.assign(
          {},
          {
            label: this.$t(`transformations.${t.name}`),
            value: t
          })
      })
    }

    get transformedValue () {
      return Transforms.apply(this.selectedTransformations.map(t => t.name), this.field_value)
    }

    get show () {
      return this.value
    }

    set show (value) {
      this.$emit('input', value)
    }

    onClose () {
      this.$root.$emit('closing_dialog')
    }

    onOpen () {
      this.$root.$emit('opening_dialog')
      this.selectedTransformations = []
      this.initial_transformations.forEach(s => {
        let tr = this.transformations.find(t => t.value.name === s)
        if (tr) {
          this.selectedTransformations.push(tr.value)
        }
      })
    }

    onOk () {
      this.$emit("ok", this.selectedTransformations.map(t => t.name).join());
      this.show = false
    }

    onCancel () {
      this.show = false
    }
}
</script>
