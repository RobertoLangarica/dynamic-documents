import { FieldType } from "src/field_types/field_type.entity"
import { Type } from "class-transformer"
import { IsNotEmpty, IsJSON, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { SimpleDto } from "src/common/dto/simple_entity.dto"

export class TransformationDto extends SimpleDto {
    @IsNotEmpty() @IsJSON() @ApiProperty()
    parameters: string

    @IsNotEmpty() @IsArray() @ApiProperty({ description: "Should be an array of names or ID's" })
    @Type(() => FieldType)
    supported_types: FieldType[]
}