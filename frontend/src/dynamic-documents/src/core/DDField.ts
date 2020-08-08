
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

  default_value: any = ''

  @Type(() => DDValidation)
  validations?: DDValidation[] = []

  // Used when this field is result of a copy from a template/document
  source_field?: string

  // Used when this field is result of a copy from a template/document
  source_template?: string

  // Used when this field is result of a copy from a template/document
  source_document?: string

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

  capture_styles: string[] = []

  print_styles: string[] = []

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
    console.log(type)
    field.type = type
    console.log(field.type)
    field.is_new = true

    return field
  }

  /**
   *
   * @param {*} source Field to copy
   * @param {*} sourceFields All the fields from the source document/template, used to copy all the fields from a group or by reference of some kind
   * @param {*} templateID Source template id
   * @param {*} documentID Source document id
   *
   * @return DDField[]
   */
  static copyField (source: DDField): DDField {
    let field = new DDField()
    Object.assign(field, source)
    field.id = uuidv4()
    field.source_field = source.id

    if (!source.map_id) {
      field.map_id = source.id
    }

    // Any relation is set to blank
    field.use_embedded = false
    delete field.dependent
    delete field.source_template
    delete field.source_document
    delete field.group_by
    delete field.embedded_fields
    delete field.replicate_with

    return field
  }

  static isGroup (field: DDField): boolean {
    return field.type.name === 'Grupo'
  }
}
