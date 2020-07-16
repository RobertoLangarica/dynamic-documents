
import { v4 as uuidv4 } from 'uuid'

export class FDataOptions {
    values = []
    alow_multiple_selection = false
    allow_other = false
}

export class FDataDependent {
    on = '' // field uuid
    accepted_values = []
}

export class FDataReplication {
    allow = false
    min_count = 0 // 0 or less mean no min count
    max_count = 0 // 0 or less mean no max count
}

export class DDField {
    id = uuidv4()
    name = ''
    type = ''
    hint = ''
    description = ''
    label = ''
    readonly = false
    value_options = new FDataOptions()
    dependent = new FDataDependent()
    required = false
    value = ''
    default_value = ''
    // validations: Validation[]
    source_field = ''// Used when this field is result of a copy from a template/document
    source_template = '' // Used when this field is result of a copy from a template/document
    source_document = '' // Used when this field is result of a copy from a template/document
    group_by = '' // Id del grupo al que pertenece
    use_embedded = false // In case this field uses an embedded value
    embedded_fields = [] // Array of uuid's referencig the fields used in the embedded form
    replication = new FDataReplication()
    get allowReplication () {
      return this.replication.allow
    }
    replicate_with = '' // Cuando el campo referenciado se duplica, este campo tmb se debe duplicar
    show_in_capture = true
    show_in_print = true
    capture_styles = []
    print_styles = []
    deleted = false // If true then the field should be removed
    is_new = false // If true the field should be added
    map_id = undefined

    static createFromType (type) {
      let field = new DDField()
      field.name = type.name
      field.type = type
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
    static copyField (source) {
      let field = new DDField()
      Object.assign(field, source)
      field.id = uuidv4()
      field.source_field = source.id

      if (!source.map_id) {
        field.map_id = source.id
      }

      // Any relation is set to blank
      field.dependent = new FDataDependent()
      field.source_template = ''
      field.source_document = ''
      field.group_by = ''
      field.use_embedded = false
      field.embedded_fields = []
      field.replicate_with = false

      return field
    }

    static isGroup (field) {
      return field.type.name === 'Grupo'
    }
}
