import { LocalStorage } from 'quasar'
import { StateInterface } from '../index'
import { MutationTree, Module } from 'vuex'

export interface ILoginState {
  token: string | null
  secret: string | null
}

const state: ILoginState = {
  token: null,
  secret: null
}

const mutations: MutationTree<ILoginState> = {
  init (state: ILoginState) {
    state.token = LocalStorage.getItem('token')
    state.secret = LocalStorage.getItem('secret')
  },
  token (state: ILoginState, value: string) {
    state.token = value
    LocalStorage.set('token', value)
  },
  secret (state: ILoginState, value: string) {
    state.secret = value
    LocalStorage.set('secret', value)
  }
}

const loginModule: Module<ILoginState, StateInterface> = {
  namespaced: true,
  state,
  mutations
}

export default loginModule
