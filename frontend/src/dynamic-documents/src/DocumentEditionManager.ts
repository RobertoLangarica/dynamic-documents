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

  isFilter: boolean = false

  template_source: string = ''

  document_source: string = ''

  toUpdate: DDField[] = []

  store: Store<StateInterface> | null = null; // Vuex instance

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onExpiredCB = () => {}

  async update (changes:{[key:string]:any}) {
    if (!this.store) {
      // no store to sync data
      return
    }

    let action
    if (this.isDocument) {
      action = 'setDocument'
    } else if (this.isTemplate) {
      action = 'setTemplate'
    } else {
      action = 'doc_filters/setFilteredDocument'
    }
    let payload = Object.assign({}, changes, { id: this.id })
    let result = await this.store?.dispatch(action, payload)
    if (!result.success) {
      if (this.isFilter && result.filter_expired) {
      // Expired filter
        this.onExpiredCB()
      } else {
      // TODO do something with the error
      }
    }
  }

  async updateFields (fields:DDField[]) {
    return this.update({ fields })
  }

  async updateField (field: DDField) {
    return this.updateFields([field])
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

    // Avoid any local field remaining for update
    let forUpdate = this.toUpdate.filter(item => !item.deleted)
    forUpdate = forUpdate.filter((f, index) => index === forUpdate.findIndex(i => i.id === f.id))
    this.toUpdate = []

    await this.updateFields(deleted.concat(forUpdate))
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
    field.sort_index = this.fields.length
    // Adding a copy so the is_new flag get deleted immediatley
    let copy = classToClass(field)
    this.fields.push(copy)
    field.is_new = true

    await this.updateFields([field])
  }

  async addFieldAtSortIndex (field: DDField, sort_index: number) {
    let indexToInsert = this.fields.findIndex(item => item.sort_index === sort_index)
    let currentIndex = this.fields.findIndex(item => item.id === field.id)
    let forUpdate: any[] = []

    if (currentIndex >= 0) {
      // Existing field
      let a = currentIndex < indexToInsert ? currentIndex : indexToInsert
      let b = currentIndex > indexToInsert ? currentIndex : indexToInsert

      for (let i = a; i <= b; i++) {
        if (indexToInsert < currentIndex) {
          // The fields go down
          if (i === b) {
            this.fields[i].sort_index = this.fields[indexToInsert].sort_index - 1
          } else {
            this.fields[i].sort_index += 1;
          }
        } else {
          // The fields go up
          if (i === a) {
            this.fields[i].sort_index = this.fields[b].sort_index
          } else {
            this.fields[i].sort_index -= 1;
          }
        }
        forUpdate.push({ id: this.fields[i].id, sort_index: this.fields[i].sort_index })
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

      // Preparing to save the new added field
      let copy = classToClass(field)
      copy.is_new = true
      forUpdate.push(copy)
    }

    await this.updateFields(forUpdate)
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

    // any array gets copied instead of using the reference that Object.assign gives us
    Object.keys(manager).forEach(k => {
      if (Array.isArray(manager[k])) {
        manager[k] = manager[k].map(item => Object.assign({}, item))
      }
    })

    manager.toUpdate = []
    return manager
  }

  public addFieldFromType (type: DDFieldType) {
    let field = DDField.createFromType(type)
    void this.addField(field)
  }
}
