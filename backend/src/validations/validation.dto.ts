import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsNotEmpty, IsString, IsOptional, IsJSON } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ValidationDto extends SimpleDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    action: string

    @IsNotEmpty() @IsString() @ApiProperty()
    error_message: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string
}