import { IsOptional, IsString, IsArray } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Category } from "src/categories/category.entity"
import { Type } from "class-transformer"
import { TemplateType } from "../../template_types/template_type.entity"
import { Field } from "./field.dto"

export class TemplateDto {
    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string

    @IsOptional() @ApiPropertyOptional({ description: 'Should be a type name or UUID' })
    @Type(() => TemplateType)
    type: TemplateType

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: 'Array of JSON strings' })
    @Type(() => Field)
    fields: Field[]

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Category)
    categories: Category[]
}