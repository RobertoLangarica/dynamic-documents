import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsString, IsOptional, IsJSON, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class ValidationDto extends SimpleDto {
    @IsOptional() @IsString() @ApiPropertyOptional()
    action: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    error_message: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string
}

export class CreateValidationDTO {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsNotEmpty() @IsString() @ApiProperty()
    action: string

    @IsNotEmpty() @IsString() @ApiProperty()
    error_message: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string
}