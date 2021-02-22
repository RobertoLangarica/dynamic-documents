
import { Type } from 'class-transformer'
import { v4 as uuidv4 } from 'uuid'
import { DDFieldType } from './DDFieldType'
import { DDValidation } from './DDValidation'

export class FDataOptions {
  values: any[] = []
  alow_multiple_selection: boolean = false
  allow_other: boolean = false
}

export class FDataDependent {
  on: string = '' // field uuid
  accepted_values: any[] = []
}

export class FDataReplication {
  allow: boolean = false
  min_count: number = 0 // 0 or less mean no min count
  max_count: number = 0 // 0 or less mean no max count
}

export class DDField {
  id: string = uuidv4()

  name: string = ''

  @Type(() => DDFieldType)
  type!: DDFieldType

  hint?: string

  description?: string

  label?: string

  readonly: boolean = false

  @Type(() => FDataOptions)
  value_options?: FDataOptions

  @Type(() => FDataDependent)
  dependent?: FDataDependent | null

  required: boolean = false

  value: any = ''

  @Type(() => DDValidation)
  validations?: DDValidation[] = []

  // Used when this field is result of a copy from a template/document
  source_field?: string

  // Id del grupo al que pertenece
  group_by?: string

  // In case this field uses an embedded value
  use_embedded: boolean = false

  // Array of uuid's referencig the fields used in the embedded form
  embedded_fields?: string[]

  @Type(() => FDataReplication)
  replication?: FDataReplication

  get allowReplication (): boolean {
    return !this.replication ? false : this.replication.allow
  }

  replicate_with?: string

  // Cuando el campo referenciado se duplica, este campo tmb se debe duplicar
  show_in_capture: boolean = true

  show_in_print: boolean = true

  sort_index: number = 0

  // If true then the field should be removed in the next remote update
  deleted?: boolean

  // If true the field should be added in the next remote update
  is_new?: boolean

  // Identifier used in the fillmaps
  map_id?: string

  static createFromType (type: DDFieldType): DDField {
    let field = new DDField()
    field.name = type.name
    field.type = type

    // Default values from the type
    if (type.parameters.field_override) {
      Object.keys(type.parameters.field_override).forEach(key => {
        field[key] = type.parameters.field_override![key]
      })
    }

    return field
  }

  static isGroup (field: DDField): boolean {
    return field.type.name === 'Grupo'
  }

  static getCopy (field: DDField):DDField {
    let copy = Object.assign({}, field)
    copy.source_field = field.id;
    copy.id = uuidv4()

    // any array gets copied instead of using the reference that Object.assign gives us
    Object.keys(copy).forEach(k => {
      if (Array.isArray(copy[k])) {
        copy[k] = copy[k].map(item => Object.assign({}, item))
      }
    })

    return copy
  }
}
