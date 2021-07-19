<template>
  <nq-field :value="formattedValue" v-bind="$attrs" :readonly="readonly">
    <template v-slot:control>
      {{ formattedValue }}
    </template>
    <template v-slot:append v-if="!print_view">
      <q-btn round flat icon="date_range" :disable="readonly">
        <q-popup-proxy @before-show="onBeforeOpen" transition-show="scale" transition-hide="scale">
          <q-date v-model="popupDate" :mask="mask" years-in-month-view>
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn label="Aceptar" color="primary" flat @click="save" v-close-popup />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-btn>
    </template>
    <template v-slot:prepend>
      <slot name="prepend" />
    </template>
    <template v-slot:append>
      <slot name="append" />
    </template>
  </nq-field>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import moment from 'moment'

@Component({ name: 'InputDate' })
export default class InputDate extends Vue {
    @Prop({ required: false, default: '' }) value!:string
    @Prop({ required: false }) readonly print_view!: boolean;
    @Prop({ required: false }) readonly readonly!: boolean;
    @Prop({ required: false, default: 'DD/MM/YYYY' }) readonly dateFormat!: string;
    @Prop({ required: false, default: 'YYYY-MM-DD HH:mm:ss' }) readonly mask!: string;
    @Prop({ required: false, default: 'es' }) readonly language!: string;

    formattedValue:string = ''
    popupDate:string = ''

    created () {
      this.formattedValue = this.format(this.value)
    }

    format (value: string) {
      if (!moment(value).locale(this.language).isValid()) {
        // TODO: Better handling of invalid dates
        return ''
      }

      return moment(value).locale(this.language).format(this.dateFormat)
    }

    @Watch('value')
    onValueChanged (newValue: string) {
      this.formattedValue = this.format(newValue)
    }

    onBeforeOpen () {
      let date = this.value ? new Date(Date.parse(this.value)) : new Date(Date.now())
      this.popupDate = moment(date.toISOString()).locale(this.language).format(this.mask)
    }

    save () {
      let iso = moment(this.popupDate).locale(this.language).toISOString()
      this.formattedValue = this.format(iso)
      this.$emit('input', iso)
    }
}
</script>
