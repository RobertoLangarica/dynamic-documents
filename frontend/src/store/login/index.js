/* eslint-disable */
import { LocalStorage } from 'quasar'

export default {
  namespaced: false,
  state: {
    token: '',
    secret: ''
  },
  mutations: {
    init (state) {
      state.token = LocalStorage.getItem('token')
      state.secret = LocalStorage.getItem('secret')
    },
    token (state, value) {
      state.token = value
      LocalStorage.set('token', value)
    },
    secret (state, value) {
      state.secret = value
      LocalStorage.set('secret', value)
    }
  },
  getters: {},
  actions: {}
}
