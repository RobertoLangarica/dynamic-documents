import api from 'api-client-wrapper'

export interface IFillmapState{
  list:any[];
  retrievedDocs:{[key:string]:boolean};
  retrievedAutofillmaps:{[key:string]:boolean};
}

const state = {
  list: [],
  retrievedDocs: {},
  retrievedAutofillmaps: {}
}

const mutations = {
  retrievedAutoFillmap (state, value) {
    state.retrievedAutofillmaps[value] = true
  },
  retrievedDoc (state, value) {
    state.retrievedDocs[value] = true
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
  },
  byDoc: state => doc_id => {
    return state.list.filter(f => f.destination_type === doc_id || f.source_type === doc_id)
  }
}

const getEmptyFillmap = (source_type, destination_type) => {
  return { source_type, destination_type, fields: [] }
}

const actions = {
  async getByDoc ({ commit, getters }, docID) {
    // Cached
    if (state.retrievedDocs[docID]) { return getters.byDoc(docID) }

    // Remote
    let path = `/fillmaps/by-type?destination=${docID}`
    console.log(`GET ${path}`)
    let result = await api.get(path)
    if (result.success) {
      commit('retrievedDoc', docID)
      result.data.items.forEach(item => commit('replace', item))
    }
    return getters.byDoc(docID)
  },
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
      commit('retrievedAutoFillmap', destination)
      result.data.items.forEach(item => commit('replace', item))
    }
    return getters.autofillmaps(destination)
  },
  async deleteField ({ commit }, { fillmap_id, field_identifier }) {
    let path = `/fillmaps/${fillmap_id}/fields/${field_identifier}`

    console.log(`PATCH ${path}`)
    let result = await api.patch(path)

    if (result.success) {
      commit('replace', result.data)
    }

    return result
  },
  async setFillmap ({ commit }, payload) {
    // WARNING for deleting field from the fillmap use deleteField
    let path = `/fillmaps`
    let method = 'post'

    if (payload.id) {
      // Is an update
      path += `/${payload.id}`
      // The source and destination are not allowed to be changed
      payload = filterObject(payload, {
        source_type: true,
        destination_type: true,
        created_at: true,
        updated_at: true
      })
      method = 'patch'
    } else {
      // avoid sending unnecessary data
      payload = filterObject(payload, { created_at: true, updated_at: true })
    }

    // Forcing autofill
    payload.autofill = true;

    console.log(`${method.toUpperCase()} ${path}`)
    let result = await api[method](path, payload)

    if (result.success) {
      commit('replace', result.data)
    }

    return result
  }
}

const filterObject = (target:any, filter:any) => {
  let copy = Object.assign({}, target)
  Object.keys(filter).forEach(key => delete copy[key])
  return copy
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
