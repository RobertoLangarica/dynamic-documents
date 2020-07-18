import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsString, IsOptional, IsJSON } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class ValidationDto extends SimpleDto {
    @IsOptional() @IsString() @ApiPropertyOptional()
    action: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    error_message: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: string
}