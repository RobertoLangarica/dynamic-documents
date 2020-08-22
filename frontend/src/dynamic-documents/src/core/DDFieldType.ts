import { DDSimpleEntity } from "./common/DDSimpleEntity";
import { DDValidation } from "./DDValidation";
import { Type } from "class-transformer";

export enum EFieldComponentID {
  INPUT_TEXT = 'input-text',
  INPUT_NUMBER = 'input-number',
  INPUT_CURRENCY = 'input-currency',
  GROUP = 'group',
  NOT_DEFINED = ''
}

export class DDFieldType extends DDSimpleEntity {
    component: EFieldComponentID = EFieldComponentID.NOT_DEFINED
    description: string = ''
    parameters: string = ''
    name: string = ''
    id: string = ''

    @Type(() => DDValidation)
    validations: DDValidation[] = []
}

export const FieldComponentUI: Record<EFieldComponentID, { component: string, parameters: any }> = {
  [EFieldComponentID.INPUT_TEXT]: { component: 'field-text-editor-component', parameters: {} },
  [EFieldComponentID.INPUT_NUMBER]: { component: 'nq-input-number', parameters: {} },
  [EFieldComponentID.INPUT_CURRENCY]: { component: 'nq-input-currency', parameters: {} },
  [EFieldComponentID.NOT_DEFINED]: { component: 'nq-input', parameters: {} },
  [EFieldComponentID.GROUP]: { component: 'field-group-component', parameters: {} },
  [EFieldComponentID.GROUP]: { component: 'field-group-component', parameters: {} }
}
