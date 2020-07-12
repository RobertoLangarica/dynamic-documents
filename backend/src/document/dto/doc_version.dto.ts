import { IsOptional, IsString, IsUUID, IsArray, IsBoolean } from "class-validator"
import { Expose, Type } from "class-transformer"

export class DocumentChange {
    @IsOptional() @IsUUID() @Expose()
    field: string

    @IsOptional() @Expose()
    value: any

    @IsOptional() @IsBoolean() @Expose()
    added: boolean

    @IsOptional() @IsBoolean() @Expose()
    deleted: boolean
}

export class DocumentVersion {
    @IsOptional() @IsString() @Expose()
    readonly created_at: string = new Date(Date.now()).toISOString()

    @IsOptional() @IsUUID() @Expose()
    source_user: string

    @IsOptional() @IsUUID() @Expose()
    source_filter: string

    @IsOptional() @IsString() @Expose()
    name: string

    @IsOptional() @IsArray() @Expose()
    @Type(() => DocumentChange)
    changes: DocumentChange[] = []
}