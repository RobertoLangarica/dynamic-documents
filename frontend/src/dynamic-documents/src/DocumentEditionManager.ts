import { v4 as uuidv4 } from 'uuid'
import { Store } from 'vuex'
import { DDField } from './core/DDField'
import { DDTemplateType } from './core/DDTemplateType';
import { DDCategory } from './core/DDCategory';
import { StateInterface } from 'src/store';
import { DDFieldType } from './core/DDFieldType';
import { DDTemplate } from './core/DDTemplate';
import { DDDocument } from './core/DDDocument';

export class DocumentEditionManager {
  id: string = uuidv4()
  name: string = '';
  type: DDTemplateType = new DDTemplateType();
  description: string = '';
  categories: DDCategory[] = [];
  fields: DDField[] = [];
  document_source: string = ''
  is_template: boolean = false
  is_filter: boolean = false

  // Properties for syncing the data
  changedFields: DDField[] = []
  documentChanges:any[] = []
  store: Store<StateInterface> | null = null; // Vuex instance

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onExpiredCB = () => {}

  get isDocument ():boolean {
    return !this.is_template && !this.is_filter
  }

  get isTemplate ():boolean {
    return this.is_template
  }

  get isFilter ():boolean {
    return this.is_filter
  }

  get storeAction ():string {
    let action
    if (this.isDocument) {
      action = 'setDocument'
    } else if (this.isTemplate) {
      action = 'setTemplate'
    } else {
      action = 'doc_filters/setFilteredDocument'
    }
    return action
  }

  get isDirty ():boolean {
    return this.changedFields.length > 0 || this.documentChanges.length > 0
  }

  async saveChanges () {
    if (!this.store || !this.isDirty) {
      /* no store to sync data */
      return
    }
    let documentChanges = this.mergeDocumentChanges()
    let fieldChanges = this.mergeFieldChanges()
    let changes = Object.assign(documentChanges, { id: this.id, fields: fieldChanges })

    let result = await this.store?.dispatch(this.storeAction, changes)
    if (!result.success) {
      if (this.isFilter && result.filter_expired) {
        // Expired filter
        this.onExpiredCB()
      } else {
        // TODO do something with the error
        return false
      }
    } else {
      this.changedFields = []
      this.documentChanges = []
    }

    return true
  }

  mergeDocumentChanges () {
    let merged = {}
    this.documentChanges.forEach(change => Object.assign(merged, change))
    return merged
  }

  mergeFieldChanges () {
    let merged = {}

    this.changedFields.forEach((change) => {
      if (!merged[change.id]) {
        merged[change.id] = {}
      }
      Object.assign(merged[change.id], change)
    })

    // The deleted fields can ignore all other changes
    let changes = Object.keys(merged).map(key => merged[key])
    changes = changes.map(change => {
      if (change.deleted) {
        return { id: change.id, deleted: true }
      }

      return change
    })

    return changes
  }

  updateDocument (change) {
    this.documentChanges.push(change)
  }

  addField (field: DDField) {
    field.sort_index = this.fields.length
    this.fields.push(field)
    this.addAddedField(field)
  }

  addFieldFromType (type: DDFieldType) {
    let field = DDField.createFromType(type)
    this.addField(field)
  }

  addFieldAtSortIndex (field: DDField, sort_index: number) {
    let indexToInsert = this.fields.findIndex(item => item.sort_index === sort_index)
    let currentIndex = this.fields.findIndex(item => item.id === field.id)
    let forUpdate: any[] = []

    if (currentIndex >= 0) {
      // Existing field
      let a = currentIndex < indexToInsert ? currentIndex : indexToInsert
      let b = currentIndex > indexToInsert ? currentIndex : indexToInsert

      for (let i = a; i <= b; i++) {
        let sortIndex = 0
        if (indexToInsert < currentIndex) {
          // The fields go down
          if (i === b) {
            sortIndex = this.fields[indexToInsert].sort_index - 1
          } else {
            sortIndex = this.fields[i].sort_index + 1
          }
        } else {
          // The fields go up
          if (i === a) {
            sortIndex = this.fields[b].sort_index
          } else {
            sortIndex = this.fields[i].sort_index - 1
          }
        }
        this.updateField({ id: this.fields[i].id, sort_index: sortIndex })
      }

      // Add the field to its correct position
      this.fields.splice(currentIndex, 1)
      this.fields.splice(indexToInsert, 0, field)
    } else {
      // Inserting a new field
      field.sort_index = sort_index
      // Minimizing data transfer
      if (indexToInsert < this.fields.length - indexToInsert) {
      // Zero to index
        for (let i = 0; i <= indexToInsert; i++) {
          this.fields[i].sort_index--;
          forUpdate.push({ id: this.fields[i].id, sort_index: this.fields[i].sort_index })
        }
      } else {
        // Index to length
        field.sort_index = indexToInsert + 1 < this.fields.length ? this.fields[indexToInsert + 1].sort_index : sort_index + 1
        for (let i = indexToInsert + 1; i < this.fields.length; i++) {
          this.fields[i].sort_index++
          forUpdate.push({ id: this.fields[i].id, sort_index: this.fields[i].sort_index })
        }
      }

      // Add the field to its correct position
      this.fields.splice(indexToInsert + 1, 0, field)
      this.addAddedField(field)
    }
  }

  deleteField (deleted: DDField) {
    let deleteIndex = this.fields.findIndex(f => f.id === deleted.id)
    this.fields.splice(deleteIndex, 1)

    // Remove any reference to the deleted field
    this.fields.forEach(field => {
      // Deleting any dependency
      if (field.dependent?.on === deleted.id) {
        this.updateField({ id: field.id, dependent: null }, field)
      }

      // Deleting any embed
      if (field.use_embedded && field.embedded_fields?.includes(deleted.id)) {
        // TODO delete the embed also from value
        this.updateField({
          id: field.id,
          embedded_fields: field.embedded_fields.filter(item => item !== deleted.id),
          use_embedded: field.embedded_fields.length > 0
        }, field)
      }

      // Delete any "replicate with" reference
      if (field.replicate_with === deleted.id) {
        this.updateField({ id: field.id, replicate_with: '' }, field)
      }

      // If it is a group all the group members are deleted
      if (DDField.isGroup(deleted)) {
        if (field.group_by === deleted.id) {
          this.deleteField(field)
        }
      }
    })

    this.addDeletedField(deleted)
  }

  addDeletedField (field: DDField) {
    this.updateField({ id: field.id, deleted: true }, field)
  }

  addAddedField (field:DDField) {
    this.updateField(Object.assign({}, field, { is_new: true }))
  }

  /**
   *
   * @param change Change represent the properties that are changing, so we notify only the changes and not all the field.
   * @param fieldRef If provided all the changes will be reflected in this reference
   */
  updateField (change:DDField | any, fieldRef:DDField | null = null) {
    if (!change.id) {
      throw new Error('An id should be provided for any field change')
    }

    if (fieldRef) {
      // local changes
      Object.assign(fieldRef, change)
    }

    // list for remote changes
    this.changedFields.push(change)
  }

  getCleanCopy () {
    // Remove any unnecessary data to be send
    let withoutExtraData:{[key:string]:any} = {}
    Object.assign(withoutExtraData, this)

    delete withoutExtraData.changedFields
    delete withoutExtraData.documentChanges
    delete withoutExtraData.store

    return withoutExtraData
  }

  async saveAsNew () {
    // Remove any unnecessary data to be send
    let withoutExtraData = this.getCleanCopy()
    delete withoutExtraData.document_source

    if (this.isDocument) {
      return await this.store?.dispatch('addDocument', withoutExtraData)
    } else {
      return await this.store?.dispatch('addTemplate', withoutExtraData)
    }
  }

  static createFromRemoteObject (remote: DDTemplate | DDDocument): DocumentEditionManager {
    let manager = new DocumentEditionManager()
    Object.assign(manager, remote)

    // We use this deep copy to avoid any array reference
    Object.keys(manager).forEach(k => {
      if (Array.isArray(manager[k])) {
        manager[k] = manager[k].map(item => Object.assign({}, item))
      }
    })

    // Empty changes for the new manager
    manager.changedFields = []
    manager.documentChanges = []

    return manager
  }
}
