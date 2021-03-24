import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator"
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
    
    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    autofill: boolean

    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string
}

export class FillmapDto {
    @IsUUID() @ApiHideProperty()
    id: string
    @IsEmpty() @ApiHideProperty()
    created_at: string
    @IsEmpty() @ApiHideProperty()
    updated_at: string

    @IsEmpty() @ApiHideProperty()
    source_type:string

    @IsEmpty() @ApiHideProperty()
    destination_type:string

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Type(() => FillmapField)
    fields: FillmapField[]

    @IsOptional() @IsBoolean() @ApiPropertyOptional()
    autofill: boolean

    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string
}