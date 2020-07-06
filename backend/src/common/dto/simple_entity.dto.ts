import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class SimpleDto {

    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string
}