import { DDTemplateBaseEntity } from "./common/DDTemplateBaseEntity"
import { DDStatus } from "./DDStatus"
import { Type } from "class-transformer"
import { DDDocumentVersion } from "./DDDocumentVersion"
import { DDCategory } from "./DDCategory"

export class DDDocument extends DDTemplateBaseEntity {
    // Null if this document wasn't created as a copy of a document
    document_source: string | null = null

    @Type(() => DDStatus)
    status: DDStatus = new DDStatus()

    @Type(() => DDDocumentVersion)
    versions: DDDocumentVersion[] = []

    @Type(() => DDCategory)
    categories: DDCategory[] = []
}
