/* eslint-disable */
import api from 'api-client-wrapper'

api.baseURL = process.env.API_URL

export default {
  namespaced: false,
  state: {
    documents: [], //TODO: Think in the posibility of use a Map instead of an array
    templates: [],
    types: []
  },
  mutations: {
    templates (state, value) {
      state.templates = value
    },
    documents (state, value) {
      state.documents = value
    },
    addTemplate (state, value) {
      state.templates.push(value)
    },
    addDocument (state, value) {
      state.documents.push(value)
    },
    updateDocument (state, value) {
      //TODO: A map would be faster to find a document
      let ind = state.documents.findIndex(item => item.id === value.id)
      if (ind >= 0) {
        state.documents[ind] = value
      } else {
        // new
        state.documents.push(value)
      }
    },
    updateTemplate (state, value) {
      let ind = state.templates.findIndex(item => item.id === value.id)
      if (ind >= 0) {
        state.templates[ind] = value
      } else {
        // new
        state.templates.push(value)
      }
    },
    types (state, value) {
      state.types = value
    }
  },
  getters: {
    template: (state) => (id) => {
      return state.templates.find(t => t.id === id)
    },
    document: (state) => (id) => {
      return state.documents.find(t => t.id === id)
    },
    owner: (state) => (id) => {
      let owner = state.templates.find(t => t.id === id)
      if (!owner) {
        owner = state.documents.find(t => t.id === id)
      }

      return owner
    }
  },
  actions: {
    async getTemplates ({ commit }) {
      console.log('GET templates')
      let result = await api.get('/templates')

      if (result.success) {
        commit('templates', result.data)
      }
    },
    async getDocuments ({ commit }) {
      console.log('GET documents')
      let result = await api.get('/documents')

      if (result.success) {
        commit('documents', result.data)
      }
    },
    async getDocument ({ getters, dispatch }, id) {
      let result = getters.document(id)

      // If the property fields is missing, then an update is needed
      if (result && result.fields) return result

      return dispatch('updateDocument', id)
    },
    async getTemplate ({ getters, dispatch }, id) {
      let result = getters.template(id)

      // If the property fields is missing, then an update is needed
      if (result && result.fields) return result

      return dispatch('updateTemplate', id)
    },
    async updateDocument ({ commit }, id) {
      console.log('GET', `/documents/${id}`)
      let result = await api.get(`/documents/${id}`)

      if (result.success) {
        commit('updateDocument', result.data)
        return result.data
      }
    },
    async updateTemplate ({ commit }, id) {
      console.log('GET', `/templates/${id}`)
      let result = await api.get(`/templates/${id}`)
      if (result.success) {
        commit('updateTemplate', result.data)
        return result.data
      }
    },
    async updateTypes ({ commit }) {
      console.log('GET', `/field_types`)
      let result = await api.get(`/field_types`)
      if (result.success) {
        commit('types', result.data)
        return result.data
      }
    },
    async setDocument ({ commit }, data) {
      console.log('PATCH', `/documents/${data.id}`)
      let result = await api.patch(`/documents/${data.id}`, data)
      if (result.success) {
        commit('updateDocument', result.data)
      }
    },
    async setTemplate ({ commit }, data) {
      console.log('PATCH', `/templates/${data.id}`)
      let result = await api.patch(`/templates/${data.id}`, data)
      if (result.success) {
        commit('updateTemplate', result.data)
      }
    },
    async addDocument ({ commit }, data) {
      console.log('POST', `/documents/`)
      let result = await api.post(`/documents/`, data)
      if (result.success) {
        commit('addDocument', result.data)
      }
    },
    async addTemplate ({ commit }, data) {
      console.log('POST', `/templates/`)
      let result = await api.post(`/templates/`, data)
      if (result.success) {
        commit('addTemplate', result.data)
      }
    }
  }
}
