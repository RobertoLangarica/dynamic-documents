import { TemplateDto } from "src/templates/dto/template.dto"
import { IsEmpty } from "class-validator"
import { ApiHideProperty } from "@nestjs/swagger"
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
}