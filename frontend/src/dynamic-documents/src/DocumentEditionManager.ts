import { v4 as uuidv4 } from 'uuid'
import { Store } from 'vuex'
import { DDField } from './core/DDField'
import { DDCategory } from './core/DDCategory';
import { StateInterface } from 'src/store';
import { DDFieldType } from './core/DDFieldType';
import { DDDocument } from './core/DDDocument';
import { IFillmap, IFillmapField } from './core/DDFillmap';

export class DocumentEditionManager {
  id: string = uuidv4()
  name: string = '';
  type: string = '';
  description: string = '';
  categories: DDCategory[] = [];
  fields: DDField[] = [];
  source_id: string = ''
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
      action = 'filtered_docs/setFilteredDocument'
    }
    return action
  }

  get isDirty ():boolean {
    return this.changedFields.length > 0 || this.documentChanges.length > 0
  }

  async saveChanges () {
    if (!this.store) {
      /* no store to sync data */
      return false
    }

    if (!this.isDirty) {
      // nothing to save
      return true
    }
    let documentChanges = this.mergeDocumentChanges()
    let fieldChanges = this.mergeFieldChanges()
    let changes = Object.assign(documentChanges, { id: this.id, fields: fieldChanges })

    // Remove the deleted fields from any fillmap of this document
    await Promise.all(fieldChanges.filter(f => f.deleted).map(deleted => this.deleteFromFillmaps(deleted)))

    let result = await this.store?.dispatch(this.storeAction, changes)
    if (!result.success) {
      if (this.isFilter && result.filter_expired) {
        // Expired filter
        this.onExpiredCB()
      }
      // TODO do something with the error
      return false
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
        return { id: change.id, deleted: true, map_id: change.map_id }
      }

      return change
    })

    return changes
  }

  async refreshDocument () {
    if (!this.store) {
      /* no store to sync data */
      return
    }
    let result = await this.store.dispatch('updateDocument', this.id)

    if (!result.success) {
      // TODO Error handling
      return
    }

    // TODO merge local changes

    // Discarding local changes
    let remote = result.data
    Object.assign(this, remote)

    // Empty changes
    this.changedFields = []
    this.documentChanges = []

    // We use this deep copy to avoid any array reference
    Object.keys(this).forEach(k => {
      if (Array.isArray(this[k])) {
        this[k] = this[k].map(item => Object.assign({}, item))
      }
    })
  }

  updateDocument (change) {
    this.documentChanges.push(change)
  }

  canBeCopiedOrReplicated (field_id:string):boolean {
    let f = this.changedFields.find(f => f.id === field_id)
    if (!f) {
      // A field with no changes could be copied
      return true;
    }

    if (f.deleted || f.is_new) {
      // A deleted field or a new field can't be copied
      return false
    }

    return true
  }

  async replicateField (field_id:string):Promise<boolean> {
    let cloned = await this.cloneField(field_id, true)
    if (cloned.length) {
      let index = this.fields.findIndex(f => f.id === field_id)
      cloned = cloned.map(f => {
        f.replicate_with = field_id
        f.show_in_edition = false
        f.replication = undefined
        return f
      })
      cloned = this.insertFieldsAt(index + 1, cloned)

      return true
    }

    return false
  }

  async copyField (field_id:string):Promise<boolean> {
    let cloned = await this.cloneField(field_id, true)
    if (cloned.length) {
      let index = this.fields.findIndex(f => f.id === field_id)
      cloned = this.insertFieldsAt(index + 1, cloned)

      return true
    }

    return false
  }

  insertFieldsAt (insertIndex:number, fields:DDField[]) {
    // The existing one goes down
    for (let i = insertIndex; i < this.fields.length; i++) {
      let field = this.fields[i]
      this.updateField({ id: field.id, sort_index: field.sort_index + fields.length })
    }

    // Sort index
    fields = fields.map((f:DDField, index:number) => {
      f.sort_index = insertIndex + index
      return f
    })

    // Inserting
    fields.forEach((field:DDField, index:number) => {
      this.fields.splice(insertIndex + index, 0, field)
      this.addAddedField(field)
    })

    return fields
  }

  async cloneField (field_id:string, keep_maps:boolean):Promise<DDField[]> {
    let cloneIndex = this.fields.findIndex(f => f.id === field_id)
    if (cloneIndex < 0) {
      // Non existent field
      return []
    }

    let toClone = this.fields[cloneIndex]

    let cloned:DDField[] = []
    // local simple copy?
    if ((!toClone.dependent || isEmpty(toClone.dependent.on)) && !toClone.use_embedded && !DDField.isGroup(toClone)) {
      let field = Object.assign({}, toClone, { source_field: toClone.id, id: uuidv4() })
      if (keep_maps) {
        // Normal maps behavior
        if (!toClone.map_id) {
          field.map_id = toClone.id
        }
      } else {
        // No preervation of any map
        field.map_id = ''
      }
      cloned.push(plainToClass(DDField, field))
    } else {
      // Remote copy
      if (this.store) {
        cloned = (await this.store.dispatch('cloneField', { document_id: this.id, field_id, keep_maps }))
          .map(f => plainToClass(DDField, f))
      }
    }
    return cloned
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
        this.updateField({ id: field.id, dependent: null })
      }

      // Deleting any embed
      if (field.use_embedded && field.embedded_fields?.includes(deleted.id)) {
        // TODO delete the embed also from value
        this.updateField({
          id: field.id,
          embedded_fields: field.embedded_fields.filter(item => item !== deleted.id),
          use_embedded: field.embedded_fields.length > 0
        })
      }

      // Delete any "replicate with" reference
      if (field.replicate_with === deleted.id) {
        this.updateField({ id: field.id, replicate_with: '' })
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

  async deleteFromFillmaps (deleted:DDField) {
    if (!this.store) { return }

    let map_id = deleted.map_id || deleted.id
    let fillmaps = this.store.getters['fillmaps/byDoc'](this.id)
    // Find all containing the deleted field
    fillmaps = fillmaps.filter((fillmap:IFillmap) => {
      // filtering all the fillmaps containing this field
      let field = fillmap.fields.find((f:IFillmapField) => map_id === f.destination || map_id === f.foreign)
      return !!field
    })

    // delete from all the fillmaps
    return Promise.all(fillmaps.map((fillmap:IFillmap) => {
      let payload = Object.assign({}, fillmap, { fields: fillmap.fields.concat() })
      let index = payload.fields.findIndex(f => map_id === f.destination || map_id === f.foreign)

      if (index >= 0) {
        payload.fields.splice(index, 1)
        return this.store!.dispatch('fillmaps/setFillmap', payload)
      }

      // Nothing to delete
      return Promise.resolve()
    }))
  }

  addDeletedField (field: DDField) {
    this.updateField({ id: field.id, deleted: true, map_id: field.map_id })
  }

  addAddedField (field:DDField) {
    this.updateField(Object.assign({}, field, { is_new: true }))
  }

  getGroupFields (group_id:string):DDField[] {
    return this.fields.filter(f => f.group_by === group_id)
  }

  /**
   *
   * @param change Partial field only with the changing properties, so we notify only the changes and not all the field.
   */
  updateField (change:DDField | any) {
    if (!change.id) {
      throw new Error('An id should be provided for any field change')
    }
    // list for remote changes
    this.changedFields.push(change)

    // Triggering some reactivity
    let index = this.fields.findIndex(f => f.id === change.id)
    if (index >= 0) {
      let field = this.fields[index]
      // local changes
      Object.assign(field, change)
      this.fields.splice(index, 1)
      this.fields.splice(index, 0, field)
    }
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
    delete withoutExtraData.source_id

    if (this.isDocument) {
      return await this.store?.dispatch('addDocument', withoutExtraData)
    } else {
      return await this.store?.dispatch('addTemplate', withoutExtraData)
    }
  }

  static createFromRemoteObject (remote: DDDocument): DocumentEditionManager {
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
