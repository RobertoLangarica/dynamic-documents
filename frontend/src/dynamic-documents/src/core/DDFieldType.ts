import { DDSimpleEntity } from "./common/DDSimpleEntity";
import { DDValidation } from "./DDValidation";
import { Type } from "class-transformer";

export enum fieldComponentID {
  INPUT_TEXT = 'input-text',
  INPUT_NUMBER = 'input-number',
  INPUT_CURRENCY = 'input-currency',
  NOT_DEFINED = ''
}

export class DDFieldType extends DDSimpleEntity {
    component: fieldComponentID = fieldComponentID.NOT_DEFINED

    parameters: string = ''

    @Type(() => DDValidation)
    validations: DDValidation[] = []
}

export const fieldComponentUI: Record<fieldComponentID, { component: string, parameters: any }> = {
  [fieldComponentID.INPUT_TEXT]: { component: 'nq-input', parameters: {} },
  [fieldComponentID.INPUT_NUMBER]: { component: 'nq-input-number', parameters: {} },
  [fieldComponentID.INPUT_CURRENCY]: { component: 'nq-input-currency', parameters: {} },
  [fieldComponentID.NOT_DEFINED]: { component: 'nq-input', parameters: {} }
}
