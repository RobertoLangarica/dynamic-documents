import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { Field } from "src/document/dto/field.dto";
import { FillmapField } from "src/fillmaps/fillmap.entity";

@Injectable()
export class FillmapFieldsValidationPipe implements PipeTransform {
    /**
     * Reads the value.fields and transform them to FillmapField instances.
     * If some property is missing then the data are rejected
     * @param value 
     * @param metadata 
     */
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.fields) {
            // fields could be empty
            return value;
        }

        if (!Array.isArray(value.fields)) {
            throw new BadRequestException('The property fields should be of type Array.')
        }

        let fields: FillmapField[]

        fields = value.fields.map((field, index) => {
            if (!field.foreign) {
                throw new BadRequestException(`Missing "foreign" property at fields[${index}]`)
            }
            if (!field.destination) {
                throw new BadRequestException(`Missing "destination" property at fields[${index}]`)
            }

            let fmf = new FillmapField()
            Object.assign(fmf,{foreign: field.foreign, destination: field.destination})
            return fmf
        })
        value.fields = fields
        return value
    }
}