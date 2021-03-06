/* eslint-disable */
import api, { APIWrapperResponse } from 'api-client-wrapper'
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import { DDDocument } from 'src/dynamic-documents/src/core/DDDocument'
import { DDTemplate } from 'src/dynamic-documents/src/core/DDTemplate'
import { DDFieldType } from 'src/dynamic-documents/src/core/DDFieldType'
import { StateInterface } from '..'
import { plainToClass } from 'class-transformer'
import axios from 'axios'
const FileDownload = require('js-file-download');

api.baseURL = process.env.API_URL!

export interface IDDState {
  documents: DDDocument[],
  templates: DDTemplate[],
  types: DDFieldType[],
  transformations:any[],
}

const state: IDDState = {
  documents: [],
  templates: [],
  types: [],
  transformations: [],
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

  transformations(state: IDDState, value: any[]) {
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

  fieldTypes: (state: IDDState): DDFieldType[] => {
    return state.types
  },

  fieldTypesCategories: (state: IDDState) => {
    return state.types.reduce((accumulator: Array<string>, current: DDFieldType) => {
      if (!accumulator.includes(current.category))  accumulator.push(current.category)
      return accumulator
    }, [])
  },

  fieldsTypesByCategory: (state: IDDState) => (category: string): DDFieldType[] => {
    return state.types.filter((fieldType: DDFieldType) => fieldType.category === category)
  }
}

const actions: ActionTree<IDDState, StateInterface> = {
  async getTemplates({ commit }): Promise<APIWrapperResponse> {
    console.log('GET templates')
    let result = await api.get('/templates')

    if (result.success) {
      commit('templates', plainToClass(DDTemplate, result.data.items as DDTemplate[]))
    }
    return result
  },
  async getDocuments({ commit }):Promise<APIWrapperResponse> {
    console.log('GET documents')
    let result = await api.get('/documents')
    if (result.success) {
      commit('documents', plainToClass(DDDocument, result.data.items as DDDocument[]))
    }
    return result
  },
  async getDocument({ getters, dispatch }, id: string): Promise<DDDocument | undefined> {
    let result = getters.document(id)

    // If the property fields is missing, then an update is needed
    if (result && result.fields) return result

    return (await dispatch('updateDocument', id)).data
  },
  async getTemplate({ getters, dispatch }, id: string): Promise<DDTemplate | undefined> {
    let result = getters.template(id)
    // If the property fields is missing, then an update is needed
    if (result && result.fields) return result

    return dispatch('updateTemplate', id)
  },
  async updateDocument({ commit }, id: string): Promise<APIWrapperResponse> {
    console.log('GET', `/documents/${id}`)
    let result = await api.get(`/documents/${id}`)

    if (result.success) {
      commit('updateDocument', result.data)
    }

    return result
  },
  async updateTemplate({ commit }, id: string): Promise<DDTemplate | undefined> {
    console.log('GET', `/templates/${id}`)
    let result = await api.get(`/templates/${id}`)
    if (result.success) {
      commit('updateTemplate', result.data)
      return result.data
    }
  },
  async getTypes({ commit }): Promise<DDFieldType[] | undefined> {
    console.log('GET', `/field_types`)
    let result = await api.get(`/field_types`)
    if (result.success) {
      commit('types', result.data.items)
      return result.data
    }
  },
  async getTransformations({ commit }): Promise<any[] | undefined> {
    console.log('GET', `/transformations`)
    let result = await api.get(`/transformations`)
    if (result.success) {
      commit('transformations', result.data.items)
      return result.data
    }
  },
  async setDocument({ commit }, data) {
    // is_template should be empty
    delete data.is_template
    if(!data.type){
      // no empty type
      delete data.type
    }

    console.log('PATCH', `/documents/${data.id}`)
    let result = await api.patch(`/documents/${data.id}`, data)
    if (result.success) {
      commit('updateDocument', result.data)
    }
    return result
  },
  async setTemplate({ commit }, data) {
    // is_template should be empty
    delete data.is_template
    if(!data.type){
      // no empty type
      delete data.type
    }

    console.log('PATCH', `/templates/${data.id}`)
    let result = await api.patch(`/templates/${data.id}`, data)
    if (result.success) {
      commit('updateTemplate', result.data)
    }
    return result
  },
  async addDocument({ commit }, data) {
    // is_template should be empty
    delete data.is_template
    if(!data.type){
      // no empty type
      delete data.type
    }

    console.log('POST', `/documents/`)
    let result = await api.post(`/documents/`, data)
    if (result.success) {
      commit('addDocument', result.data)
    }
    return result
  },
  async addTemplate({ commit }, data) {
    // is_template should be empty
    delete data.is_template
    if(!data.type){
      // no empty type
      delete data.type
    }
    
    console.log('POST', `/templates/`)
    let result = await api.post(`/templates/`, data)
    if (result.success) {
      commit('addTemplate', result.data)
    }
    return result
  },
  async download({rootState}, {id, name, auth}){
    let path = `/files/${id}`
    console.log('GET', path)
    auth = auth || `Bearer ${rootState.session.token}`
    
    return new Promise((resolve)=>{
      // api.setAuthorization
      axios.get(`${api.baseURL}${path}`,{responseType: 'blob', headers: {'Authorization':auth}})
      .then((response) => {
        FileDownload(response.data, `${name}.pdf`);
        resolve(response)
      }).catch((e)=>{
        console.log('Error',e)
        resolve(e)
      })
    })
  }
}

export default {
  namespaced: false,
  state,
  mutations,
  getters,
  actions
}
