import { DocumentChange } from "src/document/dto/doc_version.dto"
import { IsNotEmpty, IsArray } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"

export class CaptureDto {

    @IsNotEmpty() @IsArray() @ApiProperty()
    @Type(() => DocumentChange)
    fields: DocumentChange[]
}