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
        data['id'] = id;
        let type = await this.type_repo.preload(data)
        // overriding the incoming validations (since validations are a relation the preload do a merge instead of a replacement)
        type.validations = data.validations;

        if (!type) {
            throw new HttpException('Unable to find the required type', HttpStatus.NOT_FOUND)
        }

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
