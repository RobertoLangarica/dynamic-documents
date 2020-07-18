import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsArray, IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Validation } from "src/validations/validation.entity";
import { Type } from "class-transformer";

export class FieldTypeDto extends SimpleDto {

    @IsOptional() @IsString() @ApiPropertyOptional()
    controller: string;

    @IsOptional() @ApiPropertyOptional()
    parameters: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Validation)
    validations: Validation[]
}