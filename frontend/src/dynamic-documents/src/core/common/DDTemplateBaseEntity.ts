import { DDEntityWithTimeStampt } from "./DDEntityWithTimeStampt"
import { DDTemplateType } from "../DDTemplateType"
import { Type } from "class-transformer"
import { DDField } from "../DDField"

export class DDTemplateBaseEntity extends DDEntityWithTimeStampt {
    name: string = ''

    @Type(() => DDTemplateType)
    type: DDTemplateType | null = null

    get typeName () {
      if (!this.type) { return '' }

      return this.type.name
    }

    description: string = ''

    @Type(() => DDField)
    fields?: DDField[]

    warnings: string[] = []
}
