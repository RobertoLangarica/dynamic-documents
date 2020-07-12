import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";
import { isUUID } from "class-validator";

@Injectable()
export class SplitNamesFromIDsPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return value
        }

        let words: string[] = value.split(',')

        // Names and IDS
        let ids = words.filter(value => {
            return isUUID(value)
        })

        let names = words.filter(value => {
            return !isUUID(value)
        })

        if (ids.length == 0 && names.length == 0) {
            return undefined
        }

        return { names: names, ids: ids }
    }
}