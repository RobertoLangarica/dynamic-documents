import Vuex from 'vuex'
import Vue from 'vue'
import session, { ISessionState } from './session'
import dd, { IDDState } from './dynamic-documents'
import doc_filters from './dynamic-documents/doc_filters'
import fillmaps, { IFillmapState } from './dynamic-documents/fillmaps'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  session:ISessionState,
  dd:IDDState,
  doc_filters:any[],
  fillmaps:IFillmapState
}

const Store = new Vuex.Store<StateInterface>({
  modules: {
    dd,
    session,
    doc_filters,
    fillmaps
  },
  strict: !!process.env.DEV
})

export default Store
