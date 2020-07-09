import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldType } from "./field_type.entity";
import { Repository } from "typeorm";
import { FieldTypeDto } from "./field_type.dto";
import { ValidationService } from "src/validations/validation.service";
import { isUUID } from "class-validator";

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
        return await this.type_repo.findOne({ id: id })
    }

    async deleteType(id: string) {
        await this.type_repo.delete({ id: id })
    }

    async addType(data: FieldTypeDto): Promise<FieldType> {
        data.validations = await this.getValidationIDs(data) as any[]

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
        // the repository.preload make a merge between arrays.
        // We avoid that by sending an empty array and replacing it for the new one after preload
        data['id'] = id;
        let validations = await this.getValidationIDs(data)
        data.validations = []
        let type = await this.type_repo.preload(data)

        if (!type) {
            throw new HttpException('Unable to find the required type', HttpStatus.NOT_FOUND)
        }

        type.validations = validations as any[]

        type = await this.type_repo.save(type)
        return type
    }

    async getValidationIDs(data: FieldTypeDto): Promise<Object[]> {
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

            ids.map(item => {
                return { id: item }
            })

            if (names.length > 0) {
                ids = ids.concat(await this.validation_service.getIDsFromNames(names))
            }

            return ids
        }
        return []
    }

    async getIDsFromNames(names: string[]): Promise<Object[]> {
        let result = []
        result = await this.type_repo.createQueryBuilder('t')
            .select("t.id")
            .where("t.name = ANY(:names)", { names: names })
            .getRawMany()

        return result.map(value => {
            return { id: value["t_id"] }
        })
    }
}
