import { IsUUID, IsNotEmpty, IsOptional, IsJSON, IsArray, IsBoolean } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Validation } from "../../validations/validation.entity"
import { FieldType } from "../common/field_type.entity"
import { Type, Exclude } from "class-transformer"

export class Field {
    @IsNotEmpty() @IsUUID() @ApiProperty()
    id: string

    @IsOptional() @ApiPropertyOptional()
    name: string

    @IsNotEmpty() @ApiProperty()
    @Type(() => FieldType)
    type: FieldType

    @IsOptional() @ApiPropertyOptional()
    hint: string

    @IsOptional() @ApiPropertyOptional()
    description: string

    @IsOptional() @ApiPropertyOptional()
    label: string

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    readonly: boolean // false: No admite cambios en modo de captura

    @IsOptional() @ApiPropertyOptional()
    @Type(() => FDataOptions)
    value_options: FDataOptions

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    @Type(() => FDataDependent)
    dependent: FDataDependent

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    required: boolean

    @IsOptional() @ApiPropertyOptional()
    value: any

    @IsOptional() @ApiPropertyOptional()
    default_value: any

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Type(() => Validation)
    validations: Validation[]

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    source_field: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    source_template: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    source_document: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    group_by: string //Id del grupo al que pertenece

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    use_embedded: boolean //In case this field uses an embedded value

    @IsNotEmpty() @ApiPropertyOptional()
    @Type(() => FDataReplication)
    replication: FDataReplication

    @Exclude()
    get allowReplication(): boolean {
        return this.replication.allow
    }

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    replicate_with: string //Cuando el campo referenciado se duplica, este campo tmb se debe duplicar
}

export class FDataOptions {
    values: any[]
    alow_multiple_selection: boolean
    allow_other: boolean
}

export class FDataDependent {
    on: string // field uuid
    accepted_values: any[]
}

export class FDataReplication {
    allow: boolean
    min_count: number // 0 or less mean no min count
    max_count: number //0 or less mean no max count
}