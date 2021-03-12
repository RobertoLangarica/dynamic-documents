<template>
    <nq-field :value="formattedValue" v-bind="$attrs">
        <template v-slot:control>
        {{formattedValue}}
            <q-popup-proxy @before-show="onBeforeOpen" transition-show="scale" transition-hide="scale">
                <q-date v-model="popupDate" :mask="mask" years-in-month-view>
                <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Aceptar" color="primary" flat @click="save" v-close-popup />
                </div>
                </q-date>
            </q-popup-proxy>
        </template>
        <template v-slot:append>
            <q-icon name="date_range">
            </q-icon>
        </template>
        <!-- <template v-slot:append>
            <q-btn flat round icon="date_range" :disable="readonly">
                <q-popup-proxy @before-show="onBeforeOpen" transition-show="scale" transition-hide="scale">
                    <q-date v-model="popupDate" :mask="mask" years-in-month-view>
                    <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="Aceptar" color="primary" flat @click="save" v-close-popup />
                    </div>
                    </q-date>
                </q-popup-proxy>
            </q-btn>
        </template> -->
    </nq-field>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import moment from 'moment'

@Component({name:'InputDate'})
export default class InputDate extends Vue{
    @Prop({ required: false, default: '' }) value!:string
    @Prop({ required: false }) readonly readonly!: boolean;
    @Prop({ required: false, default:'DD/MM/YY' }) readonly dateFormat!: string;
    @Prop({ required: false, default:'YYYY-MM-DD HH:mm:ss' }) readonly mask!: string;

    formattedValue:string = ''
    popupDate:string = ''

    created(){
        this.formattedValue = this.format(this.value)
    }
    
    format (value: string) {
        return moment(value).format(this.dateFormat)
    }

    @Watch('value')
    onValueChanged (newValue: number|string) {
        if (!this.focused) {
        this.formattedValue = this.format(newValue)
        }
    }

    onBeforeOpen(){
         let date = this.value ? new Date(Date.parse(this.value)) : new Date(Date.now())
         this.popupDate = moment(date.toISOString()).format(this.mask)
    }

    save(){
        let iso = moment(this.popupDate).toISOString()
        this.formattedValue = this.format(iso)
        this.$emit('input',iso)
    }
}
</script>