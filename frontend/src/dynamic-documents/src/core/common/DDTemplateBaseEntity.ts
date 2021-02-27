import { DDEntityWithTimeStampt } from "./DDEntityWithTimeStampt"
import { Type } from "class-transformer"
import { DDField } from "../DDField"

export class DDTemplateBaseEntity extends DDEntityWithTimeStampt {
    name: string = ''

    type: string = ''

    description: string = ''

    @Type(() => DDField)
    fields?: DDField[]

    warnings: string[] = []
}
