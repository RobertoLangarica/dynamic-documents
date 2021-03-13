import { IsJSON, IsOptional, IsNotEmpty, IsString } from "class-validator"
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger"

export class TransformationDto {
    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string
    
    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: {[key:string]:any}
}

export class CreateTransformationDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string

    @IsOptional() @IsJSON() @ApiPropertyOptional()
    parameters: {[key:string]:any}
}