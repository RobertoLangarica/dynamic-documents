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
  field_override?: { [k: string]: any }
}
export class DDFieldType extends DDSimpleEntity {
  component: EFieldComponentID = EFieldComponentID.NOT_DEFINED
  description: string = ''
  name: string = ''
  id: string = ''
  parameters: IFieldTypeParams = {}

  @Type(() => DDValidation)
  validations: DDValidation[] = []
}

export const FieldComponentUI: Record<EFieldComponentID, { component: string, parameters: any }> = {
  [EFieldComponentID.INPUT_TEXT]: { component: 'nq-input', parameters: {} },
  [EFieldComponentID.INPUT_PARAGRAPH]: { component: 'field-text-editor-component', parameters: {} },
  [EFieldComponentID.INPUT_NUMBER]: { component: 'nq-input-number', parameters: {} },
  [EFieldComponentID.INPUT_CURRENCY]: { component: 'nq-input-currency', parameters: {} },
  [EFieldComponentID.NOT_DEFINED]: { component: 'nq-input', parameters: {} },
  [EFieldComponentID.GROUP]: { component: 'field-group-component', parameters: {} },
  [EFieldComponentID.GROUP]: { component: 'field-group-component', parameters: {} }
}
