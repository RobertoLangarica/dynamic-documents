/* eslint-disable */
import api from 'api-client-wrapper'
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { DDDocument } from 'src/dynamic-documents/src/core/DDDocument'
import { DDTemplate } from 'src/dynamic-documents/src/core/DDTemplate'
import { DDFieldType } from 'src/dynamic-documents/src/core/DDFieldType'
import { StateInterface } from '..'
import { plainToClass } from 'class-transformer'
import { DDTransformation } from 'src/dynamic-documents/src/core/DDTransformation'
import { i18n } from 'src/boot/i18n'

api.baseURL = process.env.API_URL!

export interface IDDState {
  documents: DDDocument[],
  templates: DDTemplate[],
  types: DDFieldType[],
  transformations: DDTransformation[]
}

const state: IDDState = {
  documents: [],
  templates: [],
  types: [],
  transformations: []
}

const mutations: MutationTree<IDDState> = {

  templates(state: IDDState, value: DDTemplate[]) {
    state.templates = value
  },

  documents(state: IDDState, value: DDDocument[]) {
    state.documents = value
  },

  addTemplate(state: IDDState, value: DDTemplate) {
    state.templates.push(value)
  },
  addDocument(state: IDDState, value: DDDocument) {
    state.documents.push(value)
  },

  updateDocument(state: IDDState, value: DDDocument) {
    let ind = state.documents.findIndex(item => item.id === value.id)
    if (ind >= 0) {
      state.documents[ind] = value
    } else {
      // new
      state.documents.push(value)
    }
  },

  updateTemplate(state: IDDState, value: DDTemplate) {
    let ind = state.templates.findIndex(item => item.id === value.id)
    if (ind >= 0) {
      state.templates[ind] = value
    } else {
      // new
      state.templates.push(value)
    }
  },

  types(state: IDDState, value: DDFieldType[]) {
    state.types = value
  },

  transformations(state: IDDState, value: DDTransformation[]) {
    state.transformations = value
  }
}

const getters: GetterTree<IDDState, StateInterface> = {

  template: (state: IDDState) => (id: string): DDTemplate | undefined => {
    return state.templates.find(t => t.id === id)
  },

  document: (state: IDDState) => (id: string): DDDocument | undefined => {
    return state.documents.find(t => t.id === id)
  },

  owner: (state: IDDState) => (id: string): DDTemplate | DDDocument | undefined => {
    let owner = state.templates.find(t => t.id === id)
    if (!owner) {
      owner = state.documents.find(t => t.id === id)
    }

    return owner
  }
}

const actions: ActionTree<IDDState, StateInterface> = {
  async getTemplates({ commit }): Promise<void> {
    console.log('GET templates')
    let result = await api.get('/templates')

    if (result.success) {
      commit('templates', plainToClass(DDTemplate, result.data.items as DDTemplate[]))
    }
  },
  async getDocuments({ commit }) {
    console.log('GET documents')
    let result = await api.get('/documents')
    if (result.success) {
      commit('documents', plainToClass(DDDocument, result.data.items as DDDocument[]))
    }
  },
  async getDocument({ getters, dispatch }, id: string): Promise<DDDocument | undefined> {
    let result = getters.document(id)

    // If the property fields is missing, then an update is needed
    if (result && result.fields) return result

    return dispatch('updateDocument', id)
  },
  async getTemplate({ getters, dispatch }, id: string): Promise<DDTemplate | undefined> {
    let result = getters.template(id)
    // If the property fields is missing, then an update is needed
    if (result && result.fields) return result

    return dispatch('updateTemplate', id)
  },
  async updateDocument({ commit }, id: string): Promise<DDDocument | undefined> {
    console.log('GET', `/documents/${id}`)
    let result = await api.get(`/documents/${id}`)

    if (result.success) {
      // fields sorted
      result.data.fields = result.data.fields.sort((a, b) => a.sort_index - b.sort_index)
      commit('updateDocument', result.data)
      return result.data
    }
  },
  async updateTemplate({ commit }, id: string): Promise<DDTemplate | undefined> {
    console.log('GET', `/templates/${id}`)
    let result = await api.get(`/templates/${id}`)
    if (result.success) {
      // fields sorted
      result.data.fields = result.data.fields.sort((a, b) => a.sort_index - b.sort_index)
      commit('updateTemplate', result.data)
      return result.data
    }
  },
  async updateTypes({ commit }): Promise<DDFieldType[] | undefined> {
    console.log('GET', `/field_types`)
    let result = await api.get(`/field_types`)
    if (result.success) {
      commit('types', result.data.items)
      return result.data
    }
  },
  async updateTransformations({ commit }): Promise<DDTransformation[] | undefined> {
    console.log('GET', `/transformations`)
    let result = await api.get(`/transformations`)
    if (result.success) {
      // using i18n to get the texts
      result.data.items.forEach(i=>{
        i.name = i18n.t(`transformations.${i.name}`)
        i.description = i18n.t(`transformations.description_${i.description}`)
      })
      commit('transformations', result.data.items)
      return result.data
    }
  },
  async setDocument({ commit }, data) {
    console.log('PATCH', `/documents/${data.id}`)
    let result = await api.patch(`/documents/${data.id}`, data)
    if (result.success) {
      commit('updateDocument', result.data)
    }
  },
  async setTemplate({ commit }, data) {
    console.log('PATCH', `/templates/${data.id}`)
    let result = await api.patch(`/templates/${data.id}`, data)
    if (result.success) {
      commit('updateTemplate', result.data)
    }
  },
  async addDocument({ commit }, data) {
    console.log('POST', `/documents/`)
    let result = await api.post(`/documents/`, data)
    if (result.success) {
      commit('addDocument', result.data)
    }
  },
  async addTemplate({ commit }, data) {
    console.log('POST', `/templates/`)
    let result = await api.post(`/templates/`, data)
    if (result.success) {
      commit('addTemplate', result.data)
    }
  }
}

export default {
  namespaced: false,
  state,
  mutations,
  getters,
  actions
}
