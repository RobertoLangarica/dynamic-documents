import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { Field } from "src/document/dto/field.dto";

@Injectable()
export class FieldsValidationPipe implements PipeTransform {
    /**
     * Read the value.fields and transform them to Field instances.
     * If the id is missing for any of the fields then data is rejected
     * @param value 
     * @param metadata 
     */
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.fields) {
            value.fields = []
            return value;
        }

        if (!Array.isArray(value.fields)) {
            throw new BadRequestException('The property fields should be of type Array.')
        }

        let fields: Field[]

        fields = value.fields.map((field, index) => {
            if (!field.id) {
                throw new BadRequestException(`Missing id property at fields[${index}]`)
            }

            // since there is no defaults we remove the undefined properties
            Object.keys(field).forEach(key => {
                if (field[key] === undefined) {
                    delete field[key]
                }
            })

            return field
        })
        value.fields = fields
        return value
    }
}