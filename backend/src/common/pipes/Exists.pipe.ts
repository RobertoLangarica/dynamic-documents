import { PipeTransform, ArgumentMetadata, Injectable, BadRequestException } from "@nestjs/common";
import { isNotEmpty } from "class-validator";

@Injectable()
export class ExistsPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!isNotEmpty(value)) {
            throw new BadRequestException('The value should exists')
        }
        return value
    }
}