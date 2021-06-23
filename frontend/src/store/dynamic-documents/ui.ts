export interface IUIState{
  hoveredElement:any;
}

const state = {
  hoveredElement: null
}

const mutations = {
  chanceHoveredElement (state, value) {
    state.hoveredElement = value
  }
}

const getters = {
}

const actions = {
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
