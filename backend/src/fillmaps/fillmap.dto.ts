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

    @IsNotEmpty() @IsUUID() @ApiProperty()
    destination_type_id:string

    @IsNotEmpty() @IsArray() @ApiProperty()
    @Type(() => FillmapField)
    fields: FillmapField[]
}

export class FillmapDto {
    @IsEmpty() @IsUUID() @ApiHideProperty()
    id: string
    @IsEmpty() @ApiHideProperty()
    created_at: string
    @IsEmpty() @ApiHideProperty()
    updated_at: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    source_type:string

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    destination_type_id:string

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Type(() => FillmapField)
    fields: FillmapField[]
}