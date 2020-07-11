import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldType } from "./field_type.entity";
import { Repository } from "typeorm";
import { FieldTypeDto } from "./field_type.dto";
import { ValidationService } from "src/validations/validation.service";

@Injectable()
export class FieldTypeService {
    constructor(
        @InjectRepository(FieldType)
        private readonly type_repo: Repository<FieldType>
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
        let validations = data.validations;
        data.validations = []
        let type = await this.type_repo.preload(data)

        if (!type) {
            throw new HttpException('Unable to find the required type', HttpStatus.NOT_FOUND)
        }

        type.validations = validations;

        type = await this.type_repo.save(type)
        return type
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
