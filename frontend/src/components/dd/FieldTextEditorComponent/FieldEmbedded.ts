import { Node } from 'tiptap'
import FieldEmbeddedComponent from './FieldEmbeddedComponent.vue'

export default class FieldEmbedded extends Node {
  get name () {
    return 'field_embedded'
  }

  get schema () {
    return {
      attrs: {
        field_id: { default: '' },
        transformations: { default: '' }
      },
      inline: true,
      group: "inline",
      atom: true,
      draggable: true,
      selectable: false,
      isolating: true,
      parseDOM: [{
        tag: 'field_embedded',
        getAttrs: dom => ({
          field_id: dom.getAttribute('field_id'),
          transformations: dom.getAttribute('transformations')
        })
      }],
      toDOM: node => ['field_embedded', node.attrs]
    }
  }

  commands ({ type }) {
    return attrs => (state, dispatch) => {
      const { selection } = state
      const position = selection.$cursor ? selection.$cursor.pos : selection.$to.pos
      const node = type.create(attrs)
      const transaction = state.tr.insert(position, node)
      dispatch(transaction)
    }
  }

  get view () {
    return FieldEmbeddedComponent;
  }
}
