import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import { ValidationService } from "src/validations/validation.service";

@Injectable()
export class ValidationsFillPipe implements PipeTransform {
    constructor(private readonly validation_service: ValidationService) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        console.log(value)
        if (!value.validations || value.validations.length === 0) {
            return value;
        }

        // Name or IDs are supported
        let names = []
        let ids = []

        value.validations.forEach(item => {
            if (!isUUID(item)) {
                // name
                names.push(item)
            } else {
                ids.push(item)
            }
        })

        ids = ids.map(item => {
            return { id: item }
        })

        if (names.length > 0) {
            ids = ids.concat(await this.validation_service.getIDsFromNames(names))
        }

        value.validations = ids;

        return value
    }
}