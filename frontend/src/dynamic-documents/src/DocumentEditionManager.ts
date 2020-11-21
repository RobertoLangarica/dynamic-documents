import { v4 as uuidv4 } from 'uuid'
import { Store } from 'vuex'
import { DDField, FDataDependent } from './core/DDField'
import { DDTemplateType } from './core/DDTemplateType';
import { Type, classToClass } from 'class-transformer';
import { DDCategory } from './core/DDCategory';
import { StateInterface } from 'src/store';
import { DDFieldType } from './core/DDFieldType';
import { DDTemplate } from './core/DDTemplate';
import { DDDocument } from './core/DDDocument';

export class DocumentEditionManager {
  id: string = uuidv4()

  name: string = '';

  @Type(() => DDTemplateType)
  type: DDTemplateType = new DDTemplateType();

  description: string = '';

  @Type(() => DDCategory)
  categories: DDCategory[] = [];

  @Type(() => DDField)
  fields: DDField[] = [];

  isTemplate: boolean = false

  isDocument: boolean = false

  template_source: string = ''

  document_source: string = ''

  toUpdate: DDField[] = []

  store: Store<StateInterface> | null = null; // Vuex instance

  async updateFields (fields:DDField[]) {
    if (this.isDocument) {
      await this.store?.dispatch('setDocument', { id: this.id, fields: fields })
    } else {
      await this.store?.dispatch('setTemplate', { id: this.id, fields: fields })
    }
  }

  async updateField (field: DDField) {
    if (this.isDocument) {
      await this.store?.dispatch('setDocument', { id: this.id, fields: [field] })
    } else {
      await this.store?.dispatch('setTemplate', { id: this.id, fields: [field] })
    }
  }

  async deleteField (field: DDField) {
    let toDelete = field

    // mark deletion
    this.toUpdate = []
    this.markForDelete(toDelete)

    // Remove locally and remotely
    let deleted: DDField[] = []
    for (let i = 0; i < this.fields.length; i++) {
      if (this.fields[i].deleted) {
        deleted.push(this.fields.splice(i--, 1)[0])
      }
    }

    // Mark for update only those fields not marked for deletion
    this.toUpdate = this.toUpdate.filter(item => !item.deleted)

    this.removeUpdateDuplicates()
    // Avoid any local field remaining for update
    let forUpdate = this.toUpdate.concat()
    this.toUpdate = []

    if (this.isDocument) {
      await this.store?.dispatch('setDocument', { id: this.id, fields: deleted.concat(forUpdate) })
    } else {
      await this.store?.dispatch('setTemplate', { id: this.id, fields: deleted.concat(forUpdate) })
    }
  }

  removeUpdateDuplicates () {
    let copy: DDField[] = []
    let existing: Map<string, boolean> = new Map<string, boolean>()
    this.toUpdate.forEach(item => {
      if (!existing.get(item.id)) {
        copy.push(item)
        existing.set(item.id, true)
      }
    })
    this.toUpdate = copy
  }

  markForDelete (toDelete: DDField) {
    toDelete.deleted = true

    this.fields.forEach(field => {
      // Eliminamos cualquier dependencia
      if (field.dependent?.on === toDelete.id) {
        field.dependent = null
        this.toUpdate.push(field)
      }

      // Eliminamos cualquier referencia embebida
      if (field.use_embedded && field.embedded_fields?.includes(toDelete.id)) {
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

  async addField (field: DDField) {
    // Adding a copy so the is_new flag get deleted immediatley
    field.sort_index = this.fields.length
    let copy = classToClass(field)
    this.fields.push(copy)
    field.is_new = true

    if (this.isDocument) {
      await this.store?.dispatch('setDocument', { id: this.id, fields: [field] })
    } else {
      await this.store?.dispatch('setTemplate', { id: this.id, fields: [field] })
    }
  }

  async addFieldAtSortIndex (field: DDField, sort_index: number) {
    let indexToInsert = this.fields.findIndex(item => item.sort_index === sort_index)

    let forUpdate: any[] = []
    // Minimizing data transfer
    if (indexToInsert < this.fields.length - indexToInsert) {
      field.sort_index = this.fields[indexToInsert].sort_index
      // Zero to index
      for (let i = 0; i <= indexToInsert; i++) {
        // this.fields[i].sort_index -= 1
        forUpdate.push({ id: this.fields[i].id, sort_index: this.fields[i].sort_index })
      }
    } else {
      field.sort_index = this.fields[indexToInsert].sort_index + 1
      // Index to length
      for (let i = indexToInsert + 1; i < this.fields.length; i++) {
        this.fields[i].sort_index += 2
        forUpdate.push({ id: this.fields[i].id, sort_index: this.fields[i].sort_index })
      }
    }

    // Adding a copy so the is_new flag get deleted immediatley
    let copy = classToClass(field)
    this.fields.push(copy)
    // Sorting of the fields
    this.fields = this.fields.sort((a, b) => a.sort_index - b.sort_index)

    // Save remote changes
    field.is_new = true
    forUpdate.push(field)

    if (this.isDocument) {
      await this.store?.dispatch('setDocument', { id: this.id, fields: forUpdate })
    } else {
      await this.store?.dispatch('setTemplate', { id: this.id, fields: forUpdate })
    }
  }

  /**
   *
   * @param {*} idToCopy UUID
   * @param {*} source DocumentEditionManager
   * @param {*} includeGroupChildren true: The copy include the children, false: No children is copied with this action
   * @return [fields] an array of copied fields
   */
  async copyField (idToCopy: string, source: DocumentEditionManager, includeGroupChildren = false, remoteUpdate = false) {
    let sourceField: DDField | undefined
    let field: DDField

    // avoiding double copies
    sourceField = this.getReferencedField(idToCopy)
    if (sourceField) {
      // already copied
      return
    }

    // Copy
    sourceField = source.fields.find(f => f.id === idToCopy)
    if (!sourceField) {
      // The specified field to copy is not present in the source
      return
    }

    field = DDField.copyField(sourceField)

    // It will be remotely added
    field.is_new = true

    if (this.isDocument) {
      field.source_document = source.id
    } else {
      field.source_template = source.id
    }

    // Adding the copy before any deep copy (to avoid circular reference)
    field.sort_index = this.fields.length
    this.fields.push(field)

    // Dependent
    if (sourceField.dependent && this.isNotEmptyString(sourceField.dependent.on)) {
      let ref = this.getReferencedField(sourceField.dependent.on)
      if (!ref) {
        await this.copyField(sourceField.dependent.on, source)
        ref = this.getReferencedField(sourceField.dependent.on)
      }
      field.dependent = new FDataDependent()
      field.dependent.on = ref!.id
      field.dependent.accepted_values = sourceField.dependent.accepted_values
    }

    // Group
    if (this.isNotEmptyString(sourceField.group_by)) {
      // the group should be copied
      let ref = this.getReferencedField(sourceField.group_by!)
      if (!ref) {
        await this.copyField(sourceField.group_by!, source)
        ref = this.getReferencedField(sourceField.group_by!)
      }
      field.group_by = ref!.id
    }

    // Embedded fields
    if (sourceField.use_embedded) {
      field.embedded_fields = []
      for (let i = 0; i < sourceField.embedded_fields!.length; i++) {
        let item = sourceField.embedded_fields![i]
        let ref = this.getReferencedField(item)
        if (!ref) {
          await this.copyField(item, source)
          ref = this.getReferencedField(item)
        }

        field.embedded_fields.push(ref!.id)

        // TODO validate if this works for every embedded case
        let regexp = new RegExp(item, 'gi')
        field.value = String(field.value).replace(regexp, ref!.id)
      }

      field.use_embedded = field.embedded_fields.length > 0
    }

    // Duplicate anchor
    if (this.isNotEmptyString(sourceField.replicate_with)) {
      let ref = this.getReferencedField(sourceField.replicate_with!)
      if (!ref) {
        await this.copyField(sourceField.replicate_with!, source)
        ref = this.getReferencedField(sourceField.replicate_with!)
      }
      field.replicate_with = ref!.id
    }

    // Include group members in the copy
    if (includeGroupChildren && DDField.isGroup(field)) {
      let inGroup = source.fields.filter(item => item.group_by === sourceField!.id)

      for (let i = 0; i < inGroup.length; i++) {
        let item = inGroup[i]
        let ref = this.getReferencedField(item.id)
        if (!ref) {
          await this.copyField(item.id, source)
          ref = this.getReferencedField(item.id)
        }

        if (ref!.group_by !== field.id) {
          if (!ref!.is_new) this.toUpdate.push(ref!)
          ref!.group_by = field.id
        }
      }
    }

    if (remoteUpdate) {
      this.removeUpdateDuplicates()

      let toAdd = this.fields.filter(f => f.is_new).map(item => {
        // Avoiding any local field with the is_new flag in local
        let copy = classToClass(item)
        item.is_new = false
        delete item.is_new
        return copy
      })

      // Avoiding garbage fields in local update queue
      let forUpdate = this.toUpdate.concat()
      this.toUpdate = []

      if (this.isDocument) {
        await this.store?.dispatch('setDocument', { id: this.id, fields: toAdd.concat(forUpdate) })
      } else {
        await this.store?.dispatch('setTemplate', { id: this.id, fields: toAdd.concat(forUpdate) })
      }
    }
  }

  getReferencedField (id: string) {
    let field = this.fields.find(f => f.id === id)

    if (field) {
      return field
    }

    field = this.fields.find(f => f.source_field === id)

    return field
  }

  isNotEmptyString (property?: string) {
    return (property !== undefined && property !== '')
  }

  async cloneDocument (sourceDoc: DocumentEditionManager) {
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

    for (let i = 0; i < sourceDoc.fields.length; i++) {
      let src = sourceDoc.fields[i]
      await copy.copyField(src.id, sourceDoc)
    }

    // The sorting order of the copied fields is probably not the original one
    let sorted: DDField[] = []
    sourceDoc.fields.forEach(src => {
      sorted.push(copy.fields.find(f => f.source_field === src.id)!)
    })

    copy.fields = sorted

    // Remove any unnecessary data to be send
    let withoutExtraData: DocumentEditionManager = {} as any
    Object.assign(withoutExtraData, copy)
    delete withoutExtraData.isTemplate
    delete withoutExtraData.isDocument
    delete withoutExtraData.toUpdate
    delete withoutExtraData.store

    if (this.isDocument) {
      await this.store?.dispatch('addDocument', withoutExtraData)
    } else {
      await this.store?.dispatch('addTemplate', withoutExtraData)
    }

    return copy
  }

  static createFromRemoteObject (remote: DDTemplate | DDDocument): DocumentEditionManager {
    let manager = new DocumentEditionManager()
    Object.assign(manager, remote)
    // TODO validate what happen with the categories and the reactivity

    // To avoid mutation errors we need copies of the fields instead of references
    manager.fields = remote.fields!.map(item => {
      let obj: DDField = {} as any
      // TODO validate what happen with the properties passed as reference between Objects
      Object.assign(obj, item)
      return obj
    })

    manager.toUpdate = []
    return manager
  }

  public addFieldFromType (type: DDFieldType) {
    let field = DDField.createFromType(type)
    void this.addField(field)
  }
}
