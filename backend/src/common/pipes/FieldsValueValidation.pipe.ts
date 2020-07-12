import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";

@Injectable()
export class FieldsValueValidationPipe implements PipeTransform {
    /**
     * Take all the values present in value.fields[].value|default_value and apply
     * the validations listed in value.fields[].validations[]. If there is any validation fail
     * a warning is saved in value.warnings[].
     * 
     * NOTE: The pipe will successfull regardless any validation failure
     * @param value 
     * @param metadata 
     */
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.fields) {
            return value
        }

        // TODO implement validations (on values and default values)
        value.warnings = ["Warnings will be present here as an array of strings.", "Example", "Example2"]

        return value
    }
}