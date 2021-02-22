import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { CategoryService } from "src/categories/category.service";
import { isUUID } from "class-validator";

@Injectable()
export class CategoriesFillPipe implements PipeTransform {
    constructor(private readonly category_service: CategoryService) { }

    /**
     * Read the value.categories and replace the names with ids to be stored as a relation
     * in the DB. If instead of a name an UUID is provided, that UUID is used as is
     * 
     * NOTE: If a non existing name is received, then a new Category will be createdwith this name
     * @param value 
     * @param metadata 
     */
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!value.categories) {
            return value
        }

        // Name or IDs are supported
        let names = []
        let ids = []

        value.categories.forEach(item => {
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
            ids = ids.concat(await this.category_service.getIDsFromNamesOrCreate(names, true))
        }

        value.categories = ids
        return value
    }
}