import Vue from 'vue'
import FieldGroupComponent from "src/components/dd/FieldGroupComponent";
import FieldTextEditorComponent from "src/components/dd/FieldTextEditorComponent/FieldTextEditorComponent";
import FieldDest from "src/components/dd/Fillmap/FieldDest";
import FieldSrc from "src/components/dd/Fillmap/FieldSrc";
// we globally register our components
Vue.component('field-group-component', FieldGroupComponent)
Vue.component('field-text-editor-component', FieldTextEditorComponent)
Vue.component('field-dest', FieldDest)
Vue.component('field-src', FieldSrc)
