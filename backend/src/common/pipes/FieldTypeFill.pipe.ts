import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { isUUID } from "class-validator";
import { FieldTypeService } from "src/field_types/field_type.service";

@Injectable()
export class FieldTypeFillPipe implements PipeTransform {
    constructor(private readonly type_service: FieldTypeService) { }

    /**
     * Read the value.supported_types and replace the names with ids to be stored as a relation
     * in the DB. If instead of a name an UUID is provided, that UUID is used as is
     * 
     * @param value 
     * @param metadata 
     */
    async transform(value: any, metadata: ArgumentMetadata) {

        if (!value.supported_types || value.supported_types.length === 0) {
            return value
        }

        // Name or IDs are supported
        let names = []
        let ids = []

        value.supported_types.forEach(item => {
            if (!isUUID(item)) {
                // name
                names.push(item)
            } else {
                ids.push(item)
            }
        })

        // this format allow us touse the repository.create function 
        ids = ids.map(item => {
            return { id: item }
        })

        if (names.length > 0) {
            ids = ids.concat(await this.type_service.getIDsFromNames(names))
        }

        // Removing duplicates
        let existing = {}
        value.supported_types = ids.filter(i => {
            if (!existing[i.id]) {
                existing[i.id] = true
                return true
            }

            return false
        });

        return value
    }

}