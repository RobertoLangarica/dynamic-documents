import { PipeTransform, ArgumentMetadata, Injectable, BadRequestException } from "@nestjs/common";
import { isUUID } from "class-validator";

@Injectable()
export class ParseUUIDOrNullPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return value
        }

        if (!isUUID(value)) {
            throw new BadRequestException('The string provided is not in UUID format')
        }

        return value
    }

}