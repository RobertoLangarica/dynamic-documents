import { store } from 'quasar/wrappers'
import Vuex from 'vuex'
import login, { ILoginState } from './login'
import dd, { IDDState } from './dynamic-documents'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  login:ILoginState,
  dd:IDDState
}

export default store(function ({ Vue }) {
  Vue.use(Vuex)

  const Store = new Vuex.Store<StateInterface>({
    modules: { dd, login },
    strict: !!process.env.DEV
  })

  return Store
})
