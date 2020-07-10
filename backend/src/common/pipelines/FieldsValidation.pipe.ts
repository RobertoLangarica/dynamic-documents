import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";
import { Field } from "src/templates/dto/field.dto";
import { plainToClass } from "class-transformer";
import { isArray } from "util";

@Injectable()
export class FieldsValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value.fields) {
            value.fields = []
            return value;
        }

        if (!isArray(value.fields)) {
            throw new BadRequestException('The property fields should be of type Array.')
        }

        let fields: Field[]

        fields = value.fields.map((field, index) => {
            let f = plainToClass(Field, field, { excludeExtraneousValues: true })

            if (!f.id) {
                throw new BadRequestException(`Missing id property at values[${index}]`)
            }

            return f
        })
        value.fields = fields
        return value
    }
}