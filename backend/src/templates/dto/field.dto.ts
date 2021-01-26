import { IsUUID, IsNotEmpty, IsOptional, IsJSON, IsArray, IsBoolean, IsString, IsNumber } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Validation } from "../../validations/validation.entity"
import { Type, Exclude, Expose } from "class-transformer"
import { FieldType } from "src/field_types/field_type.entity"

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

@Exclude()
export class Field {
    @IsNotEmpty() @IsString() @ApiProperty()
    @Expose()
    id: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    @Expose()
    name: string

    @IsNotEmpty() @IsString() @ApiProperty({ description: 'Type name' })
    @Expose()
    @Type(() => FieldType)
    type: FieldType

    @IsOptional() @IsString() @ApiPropertyOptional()
    @Expose()
    hint: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    @Expose()
    description: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    @Expose()
    label: string

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    readonly: boolean // false: No admite cambios en modo de captura

    @IsOptional() @ApiPropertyOptional()
    @Expose()
    @Type(() => FDataOptions)
    value_options: FDataOptions

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    @Expose()
    @Type(() => FDataDependent)
    dependent: FDataDependent

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    required: boolean

    @IsOptional() @ApiPropertyOptional()
    @Expose()
    value: any

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Expose()
    @Type(() => Validation)
    validations: Validation[]

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    @Expose()
    source_field: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    @Expose()
    source_template: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    @Expose()
    source_document: string // Used when this field is result of a copy from a template/document

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    @Expose()
    group_by: string //Id del grupo al que pertenece

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    use_embedded: boolean //In case this field uses an embedded value

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Expose()
    embedded_fields: string[] // Array of uuid's referencig the fields used in the embedded form

    @IsOptional() @ApiPropertyOptional()
    @Expose()
    @Type(() => FDataReplication)
    replication: FDataReplication

    @Expose()
    get allowReplication(): boolean {
        return this.replication?.allow
    }

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    @Expose()
    replicate_with: string //Cuando el campo referenciado se duplica, este campo tmb se debe duplicar

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    show_in_capture: boolean

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    show_in_print: boolean

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Expose()
    capture_styles: string[]

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Expose()
    print_styles: string[]

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    deleted: boolean // If true then the field should be removed

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    @Expose()
    is_new: boolean // If true the field should be added

    @IsOptional() @IsString() @ApiPropertyOptional()
    @Expose()
    map_id: string // Id used by the fill maps

    @IsOptional() @IsNumber() @ApiPropertyOptional()
    @Expose()
    sort_index: number = 0
}