import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsJSON, IsNotEmpty, IsArray, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Validation } from "src/validations/validation.entity";
import { Type } from "class-transformer";

export class FieldTypeDto extends SimpleDto {

    @IsNotEmpty() @IsString() @ApiProperty()
    controller: string;

    @IsNotEmpty() @IsJSON() @ApiProperty()
    parameters: string

    @IsNotEmpty() @IsArray() @ApiProperty({ description: "Should be an array of names or ID's" })
    @Type(() => Validation)
    validations: Validation[]
}