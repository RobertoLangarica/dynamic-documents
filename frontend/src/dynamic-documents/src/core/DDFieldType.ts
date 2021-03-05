import { DDSimpleEntity } from "./common/DDSimpleEntity";
import { DDValidation } from "./DDValidation";
import { Type } from "class-transformer";

export enum EFieldComponentID {
  INPUT_TEXT = 'input-text',
  INPUT_NUMBER = 'input-number',
  INPUT_CURRENCY = 'input-currency',
  GROUP = 'group',
  INPUT_PARAGRAPH = 'input-paragraph',
  NOT_DEFINED = ''
}

export interface IFieldTypeParams {
  [key: string]: any
  field_override?: { [k: string]: any },
  block_capture?:boolean
}
export class DDFieldType extends DDSimpleEntity {
  category: string = ''
  order: number = 0
  component: EFieldComponentID = EFieldComponentID.NOT_DEFINED
  description: string = ''
  name: string = ''
  id: string = ''
  parameters: IFieldTypeParams = {}

  @Type(() => DDValidation)
  validations: DDValidation[] = []

  static getUIComponentName (type:DDFieldType):string {
    return FieldComponentUI[type.component] || 'nq-input'
  }
}

/* Override for the components */
export const FieldComponentUI: Record<EFieldComponentID, string> = {
  [EFieldComponentID.INPUT_TEXT]: 'nq-input',
  [EFieldComponentID.INPUT_PARAGRAPH]: 'field-text-editor-component',
  [EFieldComponentID.INPUT_NUMBER]: 'nq-input-number',
  [EFieldComponentID.INPUT_CURRENCY]: 'nq-input-currency',
  [EFieldComponentID.NOT_DEFINED]: 'nq-input',
  [EFieldComponentID.GROUP]: 'field-group-component'
}
