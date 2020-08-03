import { DDSimpleEntity } from "./common/DDSimpleEntity";
import { DDValidation } from "./DDValidation";
import { Type } from "class-transformer";

export class DDFieldType extends DDSimpleEntity {
    component: string = ''

    parameters: string = ''

    @Type(() => DDValidation)
    validations: DDValidation[] = []
}