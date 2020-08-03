import { DDTemplateBaseEntity } from "./common/DDTemplateBaseEntity"
import { DDStatus } from "./DDStatus"
import { Type } from "class-transformer"
import { DDDocumentVersion } from "./DDDocumentVersion"
import { DDCategory } from "./DDCategory"

export class DDDocument extends DDTemplateBaseEntity {
    // Null if this document wasn't created using a template
    template_source: string | null = null

    // Null if this document wasn't created as a copy of a document
    document_source: string | null = null

    @Type(() => DDStatus)
    status: DDStatus = new DDStatus()

    @Type(() => DDDocumentVersion)
    versions: DDDocumentVersion[] = []

    // HTML precalculado para visualizar cuando solo se va consultar el documento
    computed_capture: string = ''

    // HTML precalculado para visualizar como impresión
    computed_print: string = ''

    @Type(() => DDCategory)
    categories: DDCategory[] = []
}
