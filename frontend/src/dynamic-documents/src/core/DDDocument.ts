import { DDStatus } from "./DDStatus"
import { Type } from "class-transformer"
import { DDDocumentVersion } from "./DDDocumentVersion"
import { DDCategory } from "./DDCategory"
import { DDEntityWithTimeStampt } from "./common/DDEntityWithTimeStampt"
import { DDField } from "./DDField"

export class DDDocument extends DDEntityWithTimeStampt {
    name: string = ''

    type: string = ''

    description: string = ''

    @Type(() => DDField)
    fields?: DDField[]

    warnings: string[] = []

    // Null if this document wasn't created as a copy of a document
    source_id: string | null = null

    @Type(() => DDStatus)
    status: DDStatus = new DDStatus()

    @Type(() => DDDocumentVersion)
    versions: DDDocumentVersion[] = []

    @Type(() => DDCategory)
    categories: DDCategory[] = []
}
