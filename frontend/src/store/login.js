var localStorage = require('localStorage')

export default {
  namespaced: false,
  state: {
    token: '',
    secret: ''
  },
  mutations: {
    init (state) {
      state.token = localStorage.getItem('token')
      state.secret = localStorage.getItem('secret')
    },
    token (state, value) {
      state.token = value
      localStorage.setItem('token', value)
    },
    secret (state, value) {
      state.secret = value
      localStorage.setItem('secret', value)
    }
  },
  getters: {},
  actions: {}
}
