import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldType } from "./field_type.entity";
import { Repository } from "typeorm";
import { FieldTypeDto } from "./field_type.dto";

@Injectable()
export class FieldTypeService {
    constructor(
        @InjectRepository(FieldType)
        private readonly type_repo: Repository<FieldType>
    ) { }

    async findAll(): Promise<Object> {
        return { items: await this.type_repo.find() }
    }

    async findById(id: string): Promise<FieldType> {
        try {
            let type = await this.type_repo.findOneOrFail({ id: id })
            return type
        } catch (e) {
            throw new NotFoundException()
        }
    }

    async deleteType(id: string) {
        let toDelete = await this.type_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.type_repo.delete({ id: id })

        return {}
    }

    async addType(data: FieldTypeDto): Promise<FieldType> {
        let type = await this.type_repo.create(data)

        try {
            type = await this.type_repo.save(type)

            // Making a find so we are returning the full object (including relations)
            return await this.type_repo.findOne(type.id)

        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

    }

    async updateType(id: string, data: FieldTypeDto): Promise<FieldType> {
        if (data.name) {
            // Prevent duplicated names
            let duplicated = await this.type_repo.createQueryBuilder('t')
                .select("t.id")
                .where("t.name = :name AND t.id != :id ", { name: data.name, id: id })
                .getRawOne()

            if (duplicated) {
                throw new ConflictException(`There is an already existing field type with the name: ${data.name}`)
            }
        }

        data['id'] = id;
        let type = await this.type_repo.preload(data)

        if (!type) {
            throw new HttpException('Unable to find the required type', HttpStatus.NOT_FOUND)
        }

        // overriding the incoming validations (since validations are a relation the preload do a merge instead of a replacement)
        type.validations = data.validations;
        type = await this.type_repo.save(type)

        // Making a find so we are returning the full object (including relations)
        return await this.type_repo.findOne(id)
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
