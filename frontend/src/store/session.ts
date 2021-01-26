import { LocalStorage } from 'quasar'
import { StateInterface } from './index'
import { MutationTree, Module } from 'vuex'
import api from 'api-client-wrapper'

export interface ISessionState {
  token: string | null
  secret: string | null
  logged: boolean
}

const state: ISessionState = {
  token: null,
  secret: null,
  logged: false
}

const mutations: MutationTree<ISessionState> = {
  logged (state: ISessionState, value) {
    state.logged = value
  },
  token (state: ISessionState, value: string) {
    state.token = value
    LocalStorage.set('token', value)
  },
  secret (state: ISessionState, value: string) {
    state.secret = value
    LocalStorage.set('secret', value)
  }
}

let actions = {
  async login ({ commit }, payload) {
    let path = `/login`
    console.log(`POST ${path}`)
    let result = await api.post(path, payload)
    if (result.success) {
      commit('token', result.data.token)
      commit('logged', true)
      api.setAuthorization(result.data.token);
    }

    return result
  },
  async localLogin ({ commit }) {
    let path = `/me`
    console.log(`GET ${path}`)

    let token:string = LocalStorage.getItem('token') || ''
    api.setAuthorization(token);

    let result = await api.get(path)
    if (result.success) {
      commit('token', token)
      commit('logged', true)
    }

    return result
  }
}

const module: Module<ISessionState, StateInterface> = {
  namespaced: true,
  state,
  actions,
  mutations
}

export default module
