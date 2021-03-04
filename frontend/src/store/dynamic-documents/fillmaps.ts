import api from 'api-client-wrapper'

export interface IFillmapState{
  list:any[];
}

const state = {
  list: []
}

const mutations = {
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
    console.log(result)
    if (result.success) {
      if (result.data.items.length) {
        commit('replace', result.data.items[0])
      }
    }
    return getters.fillmap(source, destination)
  },
  async setFillmap ({ commit }, payload) {
    let path = `/fillmaps`
    let method = 'post'

    if (payload.id) {
      // Is an update
      path += `/${payload.id}`
      method = 'patch'
    }

    console.log(`${method.toUpperCase()} ${path}`)
    let result = await api[method](path, payload)

    if (result.success) {
      console.log('replacing', result.data)
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
