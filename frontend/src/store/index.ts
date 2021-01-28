import Vuex from 'vuex'
import Vue from 'vue'
import session, { ISessionState } from './session'
import dd, { IDDState } from './dynamic-documents'
import doc_filters from './dynamic-documents/doc_filters'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  session:ISessionState,
  dd:IDDState,
  doc_filters:any[]
}

const Store = new Vuex.Store<StateInterface>({
  modules: {
    dd,
    session,
    doc_filters
  },
  strict: !!process.env.DEV
})

export default Store
