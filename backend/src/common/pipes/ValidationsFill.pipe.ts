import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";
import { ValidationService } from "src/validations/validation.service";

@Injectable()
export class ValidationsFillPipe implements PipeTransform {
    constructor(private readonly validation_service: ValidationService) { }

    /**
     * Read the value.validations and replace the names with ids to be stored as a relation
     * in the DB. If instead of a name an UUID is provided, that UUID is used as is
     * @param value 
     * @param metadata 
     */
    async transform(value: any, metadata: ArgumentMetadata) {
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

        // Removing duplicates
        let existing = {}
        value.validations = ids.filter(i => {
            if (!existing[i.id]) {
                existing[i.id] = true
                return true
            }

            return false
        });

        return value
    }
}