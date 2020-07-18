import { IsOptional, IsDateString, IsEmpty, IsString, IsArray } from "class-validator";
import { ApiPropertyOptional, ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { FilterField } from "./doc_filter.entity";

export class DocFilterDto {

    @IsOptional() @IsString() @ApiPropertyOptional()
    name: string

    @IsOptional() @IsString() @ApiPropertyOptional({ description: "Name or UUID accepted" })
    document: string

    @IsOptional() @IsDateString() @ApiPropertyOptional({ description: 'UTC ISO string' })
    expiration_date: string

    @IsOptional() @IsString() @ApiPropertyOptional()
    description: string

    @IsEmpty() @ApiHideProperty()
    owner: string

    @IsOptional() @IsArray() @ApiPropertyOptional()
    @Type(() => FilterField)
    fields: FilterField[]

    @IsEmpty() @ApiHideProperty()
    expired: boolean


}
