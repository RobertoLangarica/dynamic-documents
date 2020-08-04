import { Type } from "class-transformer"

export class DDDocumentChange {
    field: string = ''
    value: any
    added: boolean = false
    deleted: boolean = false
}

export class DDDocumentVersion {
    readonly created_at: string = new Date(Date.now()).toISOString()
    source_user: string | null = null
    source_filter: string | null = null
    name: string = ''
    @Type(() => DDDocumentChange)
    changes: DDDocumentChange[] = []
}
