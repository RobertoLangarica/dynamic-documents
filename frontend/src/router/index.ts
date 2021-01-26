import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import store from '../store'

Vue.use(VueRouter)

const Router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,

  // Leave these as is and change from quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

// Guards
Router.beforeEach(async (to, from, next) => {
  if (to.meta.protected === undefined) {
    // public route
    next()
    return
  }

  // Trying to restore the session
  if (!store.state.session.logged) {
    // local login
    await store.dispatch('session/localLogin')
  }

  if (store.state.session.logged) {
    next()
  } else {
    // Trying to reach a non public route without login
    next({ path: `/login?redirect=${to.path}`, params: { redirect: to.path } })
  }
})

export default Router
