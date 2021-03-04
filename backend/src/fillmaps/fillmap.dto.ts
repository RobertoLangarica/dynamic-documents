import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
import { FillmapField } from "./fillmap.entity"

export class FillmapCreationDto {
    @IsEmpty() @ApiHideProperty()
    id: string

    @IsEmpty() @ApiHideProperty()
    created_at: string
    
    @IsEmpty() @ApiHideProperty()
    updated_at: string

    @IsNotEmpty() @IsString() @ApiProperty()
    source_type:string

    @IsNotEmpty() @IsString() @ApiProperty()
    destination_type:string

    @IsNotEmpty() @IsArray() @ApiProperty()
    @Type(() => FillmapField)
    fields: FillmapField[]
}

export class FillmapDto {
    @IsUUID() @ApiHideProperty()
    id: string
    @IsEmpty() @ApiHideProperty()
    created_at: string
    @IsEmpty() @ApiHideProperty()
    updated_at: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    source_type:string

    @IsOptional() @IsString() @ApiPropertyOptional()
    destination_type:string

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Type(() => FillmapField)
    fields: FillmapField[]
}