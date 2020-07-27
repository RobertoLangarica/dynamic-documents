import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsArray, IsString, IsOptional, IsJSON, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { Validation } from "src/validations/validation.entity";
import { Type } from "class-transformer";

export class FieldTypeDto extends SimpleDto {

    @IsOptional() @IsString() @ApiPropertyOptional()
    component: string;

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Validation)
    validations: Validation[]
}

export class CreateFieldTypeDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsNotEmpty() @IsString() @ApiProperty()
    component: string;

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string

    @IsOptional() @IsArray() @ApiPropertyOptional({ description: "Should be an array of names or ID's" })
    @Type(() => Validation)
    validations: Validation[]
}