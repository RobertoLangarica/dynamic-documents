import api from 'api-client-wrapper'

export interface IFillmapState{
  list:any[];
  retrievedAutofillmaps:{[key:string]:boolean};
}

const state = {
  list: [],
  retrievedAutofillmaps: {}
}

const mutations = {
  retrieved (state, value) {
    state.retrieved[value] = true
  },
  replace (state, value) {
    let itemIndex = state.list.findIndex(i => i.id === value.id)
    if (itemIndex < 0) {
      // New one
      state.list.push(value)
    } else {
      // Replace
      state.list.splice(itemIndex, 1)
      state.list.splice(itemIndex, 0, value)
    }
  }
}

const getters = {
  fillmap: state => (source_type, destination_type, includeEmpty = false) => {
    let result = state.list.find(f => f.source_type === source_type && f.destination_type === destination_type)

    if (!result) {
      result = state.list.find(f => f.source_type === destination_type && f.destination_type === source_type)
    }
    if (!result && includeEmpty) {
      result = getEmptyFillmap(source_type, destination_type)
    }

    return result
  },
  autofillmaps: state => destination_type => {
    return state.list.filter(f => f.destination_type === destination_type && f.autofill)
  }
}

const getEmptyFillmap = (source_type, destination_type) => {
  return { source_type, destination_type, fields: [] }
}

const actions = {
  async getFillmap ({ commit, getters }, { source, destination }) {
    // Empty source or destination
    if (!source || !destination) {
      return getEmptyFillmap(source, destination)
    }

    // Cached
    let fillmap = getters.fillmap(source, destination)
    if (fillmap) { return fillmap }

    // Remote
    let path = `/fillmaps/by-type?source=${source}&destination=${destination}`
    console.log(`GET ${path}`)
    let result = await api.get(path)
    if (result.success) {
      if (result.data.items.length) {
        commit('replace', result.data.items[0])
      }
    }
    return getters.fillmap(source, destination)
  },
  async getAutoFillmaps ({ commit, getters, state }, destination) {
    // Cached
    if (state.retrievedAutofillmaps[destination]) { return getters.autofillmaps(destination) }

    // Remote
    let path = `/fillmaps/autofillmaps?destination=${destination}`
    console.log(`GET ${path}`)
    let result = await api.get(path)
    if (result.success) {
      result.data.items.forEach(item => commit('replace', item))
    }
    return getters.autofillmaps(destination)
  },
  async setFillmap ({ commit }, payload) {
    let path = `/fillmaps`
    let method = 'post'

    if (payload.id) {
      // Is an update
      path += `/${payload.id}`
      // The source and destination are not allowed to be changed
      delete payload.source_type
      delete payload.destination_type

      method = 'patch'
    }

    console.log(`${method.toUpperCase()} ${path}`)
    let result = await api[method](path, payload)

    if (result.success) {
      commit('replace', result.data)
    }

    return result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
