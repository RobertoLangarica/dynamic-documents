import { PipeTransform, ArgumentMetadata, Injectable, NotFoundException } from "@nestjs/common";
import { isUUID } from "class-validator";
import { TemplateTypeService } from "src/template_types/template_type.service";

@Injectable()
export class ExistsTemplateTypePipe implements PipeTransform {
    constructor(private readonly template_type_service: TemplateTypeService) { }

    /**
     * Read the value and search a TemplateType with this id and expect to find one
     * @param value 
     * @param metadata 
     */
    async transform(value: any, metadata: ArgumentMetadata) {
        if(!value){
            // the value could be empty and in that case we continue
            return value
        }

        try{
            await this.template_type_service.findById(value)
        }catch(e){
            throw new NotFoundException('The template type should be an existing one')
        }

        return value
    }
}