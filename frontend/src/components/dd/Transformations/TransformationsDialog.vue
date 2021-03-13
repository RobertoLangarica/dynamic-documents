<template>
  <q-dialog ref="dialog" v-model="show" @before-show="onOpen" @before-hide="onBeforeClose">
    <q-card v-if="!embedded" class="row justify-between" dense>
      <q-card-section class="col-12">
        <h6 class="q-ma-none">{{ title }}</h6>
      </q-card-section>
      <q-card-section class="col-12">
        <transformations 
          ref="transforms"
          :value="field_value" 
          :options="transformOptions" 
          :initial_options="initial_transformations"/>
      </q-card-section>
      <q-card-actions align="right" class="col-12">
        <q-btn flat color="secondary" label="Cancelar" @click="onCancel" />
        <q-btn color="primary" label="Aceptar" @click="onAccept" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Transforms from 'src/transformations'
import Transformations from './Transformations.vue'

@Component({ components: { Transformations } })
export default class TransformationsDialog extends Vue {
    @Prop({ required: true }) value!: boolean;
    @Prop({ required: true, default: '' }) field_value!: any;
    @Prop({ required: false, default: 'Aplicar transformaciones' }) readonly title!: string;
    @Prop({ required: false, default: () => [] }) readonly initial_transformations!: string[];

    get show () {
      return this.value
    }

    set show (value) {
      this.$emit('input', value)
    }

    get embedded () {
    // @ts-ignore
      return this.$root.invisibleDialogs
    }

    onBeforeClose () {
      if (this.embedded) {
        this.$root.$off('complete_dialog_action', this.onSelected)
        this.$root.$off('cancel_dialog_action', this.onCancel)
      }
    }

    onOpen () {
      if (this.embedded) {
        this.$root.$on('complete_dialog_action', this.onSelected)
        this.$root.$on('cancel_dialog_action', this.onCancel)
        this.$root.$emit('send_message', {
          message: 'opening_dialog',
          data: {
            type: 'TransformationsDialog',
            title: this.title,
            options: this.transformOptions,
            initial_options: this.initial_transformations,
            value: this.field_value
          }
        })
      }
    }

    get transformOptions(){
      return this.$store.state.dd.transformations
    }

    onAccept(){
      this.onSelected((this.$refs.transforms as any).getSelectedTransformationsAsString())
    }

    onSelected (selected) {
      this.$emit("ok", selected);
      this.show = false
    }

    onCancel () {
      this.show = false
    }
}
</script>
