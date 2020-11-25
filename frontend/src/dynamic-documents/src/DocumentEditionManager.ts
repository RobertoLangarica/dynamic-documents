import { v4 as uuidv4 } from 'uuid'
import { Store } from 'vuex'
import { DDField } from './core/DDField'
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

  async update (changes:{[key:string]:any}) {
    if (this.isDocument) {
      await this.store?.dispatch('setDocument', Object.assign(changes, { id: this.id }))
    } else {
      await this.store?.dispatch('setTemplate', Object.assign(changes, { id: this.id }))
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

  getCleanCopy ():DocumentEditionManager {
    // Remove any unnecessary data to be send
    let withoutExtraData: DocumentEditionManager = {} as any
    Object.assign(withoutExtraData, this)
    delete withoutExtraData.isTemplate
    delete withoutExtraData.isDocument
    delete withoutExtraData.toUpdate
    delete withoutExtraData.store

    return withoutExtraData
  }

  async saveAsNew () {
    this.document_source = ''
    this.template_source = ''

    // Remove any unnecessary data to be send
    let withoutExtraData = this.getCleanCopy()

    if (this.isDocument) {
      await this.store?.dispatch('addDocument', withoutExtraData)
    } else {
      await this.store?.dispatch('addTemplate', withoutExtraData)
    }
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
