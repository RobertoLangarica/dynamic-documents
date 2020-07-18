import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { FilterField } from "src/document_filter/doc_filter.entity";
import { DocumentService } from "src/document/document.service";
import { isUUID } from "class-validator";

@Injectable()
export class FilterValidationPipe implements PipeTransform {
    constructor(
        private readonly doc_service: DocumentService) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return value
        }

        // Avoiding extra data for the fields
        if (value.fields) {
            value.fields = plainToClass(FilterField, value.fields, { excludeExtraneousValues: true })
        }

        // Avoiding unexisting documents
        if (value.document) {
            if (isUUID(value.document)) {
                if (!await this.doc_service.exists(value.document)) {
                    throw new BadRequestException(`There is no matching document with the UUID: ${value.document}`)
                }
            } else {
                // Getting the id
                let id = await this.doc_service.getIDFromName(value.document)

                if (!id) {
                    throw new BadRequestException(`There is no matching document with the name: ${value.document}`)
                }
                value.document = id["id"]
            }
        }

        return value
    }
}