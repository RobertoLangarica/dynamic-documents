import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldType } from "./field_type.entity";
import { Repository } from "typeorm";
import { UUIDVersion, isUUID } from "class-validator";
import { FieldTypeDto } from "./field_type.dto";
import { ValidationService } from "src/validations/validation.service";

@Injectable()
export class FieldTypeService {
    constructor(
        @InjectRepository(FieldType)
        private readonly type_repo: Repository<FieldType>,
        private readonly validation_service: ValidationService
    ) { }

    async findAll(): Promise<FieldType[]> {
        return await this.type_repo.find()
    }

    async findById(id: string): Promise<FieldType> {
        this.validateUUID(id)
        return await this.type_repo.findOne({ id: id })
    }

    async deleteType(id: string) {
        this.validateUUID(id)

        await this.type_repo.delete({ id: id })
    }

    async addType(data: FieldTypeDto): Promise<FieldType> {
        if (data.validations.length > 0) {
            // Name or IDs are supported
            let names = []
            let ids = []

            data.validations.forEach(item => {
                if (!isUUID(item)) {
                    // name
                    names.push(item)
                } else {
                    ids.push(item)
                }
            })

            if (names.length > 0) {
                data.validations = ids.concat(await this.validation_service.getIDsFromNames(names))
            }
        }

        let type = await this.type_repo.create(data)

        try {
            type = await this.type_repo.save(type)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return type
    }

    async updateType(id: string, data: FieldTypeDto): Promise<FieldType> {
        return null
    }

    validateUUID(value: string, version?: UUIDVersion) {
        if (!isUUID(value, version)) {
            throw new HttpException('The id received is not an UUID', HttpStatus.BAD_REQUEST)
        }
    }
}
