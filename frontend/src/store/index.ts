import Vuex from 'vuex'
import Vue from 'vue'
import session, { ISessionState } from './session'
import dd, { IDDState } from './dynamic-documents'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  session:ISessionState,
  dd:IDDState
}

const Store = new Vuex.Store<StateInterface>({
  modules: {
    dd,
    session
  },
  strict: !!process.env.DEV
})

export default Store
