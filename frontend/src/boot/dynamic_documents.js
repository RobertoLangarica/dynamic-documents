import Vue from 'vue'
import FieldGroupComponent from "src/components/dd/FieldGroupComponent";
import FieldTextEditorComponent from "src/components/dd/FieldTextEditorComponent/FieldTextEditorComponent";
import InputNumberWrapper from "src/components/inputs/InputNumberWrapper";
import InputDateWrapper from "src/components/inputs/InputDateWrapper";

// we globally register our components
Vue.component('field-group-component', FieldGroupComponent)
Vue.component('field-text-editor-component', FieldTextEditorComponent)
Vue.component('input-number-wrapper', InputNumberWrapper)
Vue.component('input-date-wrapper', InputDateWrapper)
