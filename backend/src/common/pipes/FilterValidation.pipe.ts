import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from "@nestjs/common";
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

        if (value.document_id) {
            if (isUUID(value.document_id)) {
                // Avoiding unexisting documents
                if (!await this.doc_service.exists(value.document_id)) {
                    throw new BadRequestException(`There is no matching document with the UUID: ${value.document_id}`)
                }
            } else {
                throw new BadRequestException(`The filter.document_id proeprty should be a valid UUID: ${value.document_id}`)
            }
        }
        return value
    }
}