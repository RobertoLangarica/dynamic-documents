export interface IUIState{
  hoveredElement:any;
}

const state = {
  hoveredElement: null
}

const mutations = {
  changeHoveredElement (state, value) {
    state.hoveredElement = value
  }
}

const getters = {
  HoveredELement: (state): any => {
    return state.hoveredElement
  }
}

const actions = {
  changeHoveredElement ({ commit }, value) {
    commit('changeHoveredElement', value)
  }
}

export default {
  namespaced: false,
  state,
  mutations,
  getters,
  actions
}
