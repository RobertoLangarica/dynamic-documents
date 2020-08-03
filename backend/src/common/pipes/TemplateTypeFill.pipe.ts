import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import { TemplateTypeService } from "src/template_types/template_type.service";

@Injectable()
export class TemplateTypeFillPipe implements PipeTransform {
    constructor(private readonly template_type_service: TemplateTypeService) { }

    /**
     * Read the value.type and replace the name with an id to be stored as a relation
     * in the DB. If instead of a name an UUID is provided, that UUID is used as is
     * 
     * NOTE: If a non existing name is received, then a new TemplateType will be created with this name
     * @param value 
     * @param metadata 
     */
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value.type) {
            return value
        }

        if (isUUID(value.type)) {
            // UUID is a valida type
            return value
        }

        value.type = await this.template_type_service.findByNameOrCreate(value.type, true)

        return value
    }
}