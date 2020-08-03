import { TemplateDto, CreateTemplateDto } from "src/templates/dto/template.dto"
import { IsEmpty, IsOptional, IsUUID } from "class-validator"
import { ApiHideProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Status } from "src/status/status.entity"
import { Type } from "class-transformer"
import { DocumentVersion } from "./doc_version.dto"

export class DocumentDto extends TemplateDto {

    @IsEmpty() @ApiHideProperty()
    @Type(() => DocumentVersion)
    versions: DocumentVersion[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => Status)
    status: Status

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    template_source: string

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    document_source: string
}

export class CreateDocumentDto extends CreateTemplateDto {
    @IsEmpty() @ApiHideProperty()
    @Type(() => DocumentVersion)
    versions: DocumentVersion[]

    @IsEmpty() @ApiHideProperty()
    @Type(() => Status)
    status: Status

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    template_source: string

    @IsOptional() @IsUUID() @ApiPropertyOptional()
    document_source: string
}