import { FieldType } from "src/field_types/field_type.entity"
import { Type } from "class-transformer"
import { IsJSON, IsArray, IsOptional, IsNotEmpty, IsString } from "class-validator"
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger"
import { SimpleDto } from "src/common/dto/simple_entity.dto"

export class TransformationDto extends SimpleDto {
    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => FieldType)
    supported_types: FieldType[]
}

export class CreateTransformationDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => FieldType)
    supported_types: FieldType[]
}