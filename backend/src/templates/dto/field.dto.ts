import { IsUUID, IsNotEmpty, IsOptional, IsJSON, IsArray, IsBoolean, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Validation } from "../../validations/validation.entity"
import { Type, Exclude, Transform, Expose } from "class-transformer"

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

export class Field {
    @IsNotEmpty() @IsUUID() @ApiProperty()
    id: string

    @IsOptional() @ApiPropertyOptional()
    name: string

    @IsNotEmpty() @IsString() @ApiProperty({ description: 'Type name' })
    type: string

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

    @IsOptional() @IsArray() @ApiPropertyOptional()
    embedded_fields: string[] // Array of uuid's referencig the fields used in the embedded form

    @IsOptional() @ApiPropertyOptional()
    @Type(() => FDataReplication)
    replication: FDataReplication

    @Exclude()
    get allowReplication(): boolean {
        return this.replication.allow
    }

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    replicate_with: string //Cuando el campo referenciado se duplica, este campo tmb se debe duplicar

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    show_in_capture: boolean

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    show_in_print: boolean

    @IsOptional() @IsArray() @ApiPropertyOptional()
    capture_styles: string[]

    @IsOptional() @IsArray() @ApiPropertyOptional()
    print_styles: string[]

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    deleted: boolean // If true then the field should be removed

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    is_new: boolean // If true the field should be added
}