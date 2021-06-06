import Vuex from 'vuex'
import Vue from 'vue'
import session, { ISessionState } from './session'
import dd, { IDDState } from './dynamic-documents'
import filtered_docs from './dynamic-documents/filtered_docs'
import fillmaps, { IFillmapState } from './dynamic-documents/fillmaps'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  session:ISessionState,
  dd:IDDState,
  filtered_docs:any[],
  fillmaps:IFillmapState,
}

const Store = new Vuex.Store<StateInterface>({
  modules: {
    dd,
    session,
    filtered_docs,
    fillmaps
  },
  strict: !!process.env.DEV
})

export default Store
