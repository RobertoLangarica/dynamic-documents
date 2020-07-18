import { PipeTransform, ArgumentMetadata, Injectable } from "@nestjs/common";

@Injectable()
export class ParseBooleanPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return value
        }

        let v = (value as string).toLocaleLowerCase()

        return !(v === '0' || v === 'false')
    }
}