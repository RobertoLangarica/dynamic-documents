import { v4 as uuidv4 } from 'uuid'
import { DDField } from './DDField'

export class DocumentEditionManager {
    id = uuidv4()
    name = '';
    type = '';
    description = '';
    categories = [];
    fields = [] // DDField[]
    isTemplate = false
    isDocument = false
    toUpdate = []
    template_source = ''
    document_source = ''
    store; // Vuex instance

    async updateField (field) {
      let i = this.fields.findIndex(f => f.id === field.id)
      this.fields[i] = field

      if (this.isDocument) {
        await this.store.dispatch('setDocument', { id: this.id, fields: [field] })
      } else {
        await this.store.dispatch('setTemplate', { id: this.id, fields: [field] })
      }
    }

    async deleteField (field) {
      let toDelete = this.fields.find(f => f.id === field.id)

      // mark deletion
      this.toUpdate = []
      this.markForDelete(toDelete)

      // Remove locally and remotely
      let deleted = []
      for (let i = 0; i < this.fields.length; i++) {
        if (this.fields[i].deleted) {
          deleted.push(this.fields.splice(i, 1)[0])
        }
      }

      // Mark for update only those fields not marked for deletion
      this.toUpdate = this.toUpdate.filter(item => !item.deleted)

      this.removeUpdateDuplicates()

      if (this.isDocument) {
        await this.store.dispatch('setDocument', { id: this.id, fields: deleted.concat(this.toUpdate) })
      } else {
        await this.store.dispatch('setTemplate', { id: this.id, fields: deleted.concat(this.toUpdate) })
      }

      this.toUpdate = []
    }

    removeUpdateDuplicates () {
      let copy = []
      let existing = {}
      this.toUpdate.forEach(item => {
        if (!existing[item.id]) {
          copy.push(item)
          existing[item.id] = true
        }
      })
      this.toUpdate = copy
    }

    markForDelete (toDelete) {
      toDelete.deleted = true

      this.fields.forEach(field => {
        // Eliminamos cualquier dependencia
        if (field.dependent && field.dependent.on === toDelete.id) {
          field.dependent = null
          this.toUpdate.push(field)
        }

        // Eliminamos cualquier referencia embebida
        if (field.use_embedded && field.embedded_fields.includes(toDelete.id)) {
          field.embedded_fields = field.embedded_fields.filter(item => item !== toDelete.id)
          field.use_embedded = field.embedded_fields.length > 0
          this.toUpdate.push(field)
        }

        // Eliminamos cualquier link para replicar
        if (field.replicate_with === toDelete.id) {
          field.replicate_with = ''
          this.toUpdate.push(field)
        }

        // Hay que eliminar todos los miembros del grupo
        if (DDField.isGroup(toDelete)) {
          if (field.group_by === toDelete.id) {
            this.markForDelete(field)
          }
        }
      })
    }

    async addField (field) {
      this.fields.push(field)
      field.is_new = true
      if (this.isDocument) {
        await this.store.dispatch('setDocument', { id: this.id, fields: [field] })
      } else {
        await this.store.dispatch('setTemplate', { id: this.id, fields: [field] })
      }
      field.is_new = false
    }

    /**
     *
     * @param {*} idToCopy UUID
     * @param {*} source DocumentEditionManager
     * @param {*} includeGroupChildren true: The copy include the children, false: No children is copied with this action
     * @return [fields] an array of copied fields
     */
    async copyField (idToCopy, source, includeGroupChildren = false, remoteUpdate = false) {
      let sourceField
      let field

      // avoiding double copies
      sourceField = this.getReferencedField(idToCopy)
      if (sourceField) {
        // already copied
        return
      }

      // Copy
      sourceField = source.fields.find(f => f.id === idToCopy)
      field = DDField.copyField(sourceField)

      // Se va agregar
      field.is_new = true

      if (this.isDocument) {
        field.source_document = source.id
      } else {
        field.source_template = source.id
      }

      // Adding the copy before any deep copy (to avoid circular reference)
      this.fields.push(field)

      // Dependent
      if (sourceField.dependent && this.isNotEmptyString(sourceField.dependent.on)) {
        let ref = this.getReferencedField(sourceField.dependent.on)
        if (!ref) {
          this.copyField(sourceField.dependent.on, source)
          ref = this.getReferencedField(sourceField.dependent.on)
        }
        field.dependent.on = ref.id
        field.dependent.accepted_values = sourceField.dependent.accepted_values
      }

      // Group
      if (this.isNotEmptyString(sourceField.group_by)) {
        // the group should be copied
        let ref = this.getReferencedField(sourceField.group_by)
        if (!ref) {
          this.copyField(sourceField.group_by, source)
          ref = this.getReferencedField(sourceField.group_by)
        }
        field.group_by = ref.id
      }

      // Embedded fields
      if (sourceField.use_embedded) {
        field.embedded_fields = []
        sourceField.embedded_fields.forEach(item => {
          let ref = this.getReferencedField(item)
          if (!ref) {
            this.copyField(item, source)
            ref = this.getReferencedField(item)
          }
          field.embedded_fields.push(ref.id)
          // TODO validate if this works for every embedded case
          let regexp = new RegExp(item.id, 'gi')
          field.value = String(field.value).replace(regexp, ref.id)
        })
        field.use_embedded = field.embedded_fields.length > 0
      }

      if (this.isNotEmptyString(sourceField.replicate_with)) {
        let ref = this.getReferencedField(sourceField.replicate_with)
        if (!ref) {
          this.copyField(sourceField.replicate_with, source)
          ref = this.getReferencedField(sourceField.replicate_with)
        }
        field.replicate_with = ref.id
      }

      // Include group members in the copy
      if (includeGroupChildren && DDField.isGroup(field)) {
        let inGroup = source.fields.filter(item => item.group_by === sourceField.id)

        inGroup.forEach(item => {
          let ref = this.getReferencedField(item.id)
          if (!ref) {
            this.copyField(item.id, source)
            ref = this.getReferencedField(item.id)
          }

          if (ref.group_by !== field.id) {
            if (!ref.is_new) this.toUpdate.push(ref)
            ref.group_by = field.id
          }
        })
      }

      if (remoteUpdate) {
        this.removeUpdateDuplicates()

        let toAdd = this.fields.filter(f => f.is_new)
        if (this.isDocument) {
          await this.store.dispatch('setDocument', { id: this.id, fields: toAdd.concat(this.toUpdate) })
        } else {
          await this.store.dispatch('setTemplate', { id: this.id, fields: toAdd.concat(this.toUpdate) })
        }

        this.toUpdate = []
      }
    }

    getReferencedField (id) {
      let field = this.fields.find(f => f.id === id)

      if (field) {
        return field
      }

      field = this.fields.find(f => f.source_field === id)

      return field
    }

    isNotEmptyString (property) {
      return (property !== undefined && property !== '')
    }

    async cloneDocument (sourceDoc) {
      let copy = new DocumentEditionManager()
      Object.assign(copy, sourceDoc)
      copy.id = uuidv4()
      copy.name = `Copy of: ${copy.name}`
      copy.fields = [] // Should be a copy instead of just a reference
      copy.toUpdate = []

      if (sourceDoc.isDocument) {
        copy.document_source = sourceDoc.id
      } else {
        copy.template_source = sourceDoc.id
        copy.document_source = ''
      }

      sourceDoc.fields.forEach(src => {
        copy.copyField(src.id, sourceDoc)
      })

      // The sorting order of the copied fields is probably not the original one
      let sorted = []
      sourceDoc.fields.forEach(src => {
        sorted.push(copy.fields.find(f => f.source_field === src.id))
      })

      copy.fields = sorted

      // Remove any unnecessary data to be send
      let withoutExtraData = {}
      Object.assign(withoutExtraData, copy)
      delete withoutExtraData.isTemplate
      delete withoutExtraData.isDocument
      delete withoutExtraData.toUpdate
      delete withoutExtraData.store

      if (this.isDocument) {
        await this.store.dispatch('addDocument', withoutExtraData)
      } else {
        await this.store.dispatch('addTemplate', withoutExtraData)
      }

      return copy
    }

    static createFromRemoteObject (remote) {
      let manager = new DocumentEditionManager()
      Object.assign(manager, remote)

      return manager
    }
}
