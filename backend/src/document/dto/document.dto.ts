import { IsArray, IsEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Status } from "src/status/status.entity"
import { Type } from "class-transformer"
import { DocumentVersion } from "./doc_version.dto"
import { Field } from "src/document/dto/field.dto"
import { Category } from "src/categories/category.entity"

export class DocumentDto {
    @IsOptional() @IsUUID() @ApiPropertyOptional()
    id: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string

    @IsOptional() @ApiPropertyOptional({ description: 'Any string' })
    type: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: 'Array of JSON strings' })
    @Type(() => Field)
    fields: Field[]

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Category)
    categories: Category[]

    @IsEmpty() @ApiHideProperty()
    warnings: string[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => DocumentVersion)
    versions: DocumentVersion[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => Status)
    status: Status

    @IsEmpty() @ApiHideProperty()
    is_template: boolean

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    source_id: string

}

export class CreateDocumentDto {
    @IsOptional() @IsUUID() @ApiPropertyOptional()
    id: string

    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @ApiPropertyOptional({ description: 'Any string' })
    type: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: 'Array of JSON strings' })
    @Type(() => Field)
    fields: Field[]

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Category)
    categories: Category[]

    @IsEmpty() @ApiHideProperty()
    warnings: string[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => DocumentVersion)
    versions: DocumentVersion[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => Status)
    status: Status

    @IsEmpty() @ApiHideProperty()
    is_template: boolean

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    source_id: string

    @IsOptional() @IsArray() @ApiPropertyOptional()
    autofill: {type:string, data:{[key:string]:any} }[]
}