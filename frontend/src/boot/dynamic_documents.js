import Vue from 'vue'

import DDGroup from 'src/dynamic-documents/components/DDGroup'

import FieldTypeSelector from 'src/dynamic-documents/components/FieldTypeSelector'
import BasicField from 'src/dynamic-documents/components/BasicField'
import TemplateMenu from 'src/dynamic-documents/components/TemplateMenu'
import DocumentEditorScreen from 'src/dynamic-documents/components/DocumentEditorScreen'
import TemplateCreationDialog from 'src/dynamic-documents/components/TemplateCreationDialog'

import FieldGroupComponent from "src/components/dd/FieldGroupComponent";

// we globally register our components
Vue.component('field-group-component', FieldGroupComponent)
Vue.component('dd-group', DDGroup)
Vue.component('field-type-selector', FieldTypeSelector)
Vue.component('basic-field', BasicField)
Vue.component('template-menu', TemplateMenu)
Vue.component('document-editor', DocumentEditorScreen)
Vue.component('template-creation-dialog', TemplateCreationDialog)
