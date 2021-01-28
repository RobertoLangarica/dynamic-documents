import api from 'api-client-wrapper'

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
  byID: state => id => {
    return state.list.find(f => f.id === id)
  }
}

const actions = {
  async getFilteredDocument ({ commit, getters }, id) {
    let doc = getters.byID(id)

    // Cached
    if (doc) { return doc }

    // Remote
    let path = `/filters/${id}/filtered`
    console.log(`GET ${path}`)
    let result = await api.get(path)
    if (result.success) {
      commit('replace', result.data)
      return getters.byID(id)
    }

    let expired = result.data ? result.data.statusCode === 403 : false
    return { success: false, filter_expired: expired }
  },
  async setFilteredDocument ({ commit, getters }, payload) {
    let path = `/filters/${payload.id}/filtered`
    console.log(`PATCH ${path}`)
    let result = await api.patch(path, payload)

    if (result.success) {
      commit('replace', result.data)
      return getters.byID(payload.id)
    }

    let expired = result.data ? result.data.statusCode === 403 : false
    return { success: false, filter_expired: expired }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
