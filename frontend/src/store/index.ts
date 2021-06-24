import Vuex from 'vuex'
import Vue from 'vue'
import session, { ISessionState } from './session'
import dd, { IDDState } from './dynamic-documents'
import filtered_docs from './dynamic-documents/filtered_docs'
import fillmaps, { IFillmapState } from './dynamic-documents/fillmaps'
import ui, { IUIState } from './dynamic-documents/ui'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StateInterface {
  session:ISessionState,
  dd:IDDState,
  filtered_docs:any[],
  fillmaps:IFillmapState,
  ui: IUIState
}

const Store = new Vuex.Store<StateInterface>({
  modules: {
    dd,
    session,
    filtered_docs,
    fillmaps,
    ui
  },
  strict: !!process.env.DEV
})

export default Store
