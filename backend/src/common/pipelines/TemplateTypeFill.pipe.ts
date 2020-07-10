import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import { TemplateTypeService } from "src/template_types/template_type.service";

@Injectable()
export class TemplateTypeFillPipe implements PipeTransform {
    constructor(private readonly template_type_service: TemplateTypeService) { }
    // private readonly create_type_if_missing: boolean = true
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value.type) {
            return value
        }

        if (isUUID(value.type)) {
            // UUID is a valida type
            return value
        }

        value.type = await this.template_type_service.findByName(value.type, true)

        return value
    }
}