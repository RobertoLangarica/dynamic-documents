<template>
    <span>
    <input-number 
        v-model="value" 
        :pattern="pattern" 
        :prefix="prefix" 
        :suffix="suffix" 
        v-bind="$attrs"
        />
        </span>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { DDField } from "src/dynamic-documents/src/core/DDField";
import InputNumber from './InputNumber.vue'

@Component({name:'InputNumberWrapper', components:{'input-number':InputNumber}})
export default class InputNumberWrapper extends Vue{
    @Prop({ required: true }) readonly field!: DDField;

    get value(){
        return this.field.value
    }

    set value(value){
        this.$emit('input', value)
    }

    get pattern(){
        return this.field.type.parameters.pattern || '0,0'
    }

    get prefix(){
        return this.field.type.parameters.prefix || ''
    }

    get suffix(){
        return this.field.type.parameters.suffix || ''
    }
}
</script>