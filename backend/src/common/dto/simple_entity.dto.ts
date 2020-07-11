import { IsString, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SimpleDto {

    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string
}