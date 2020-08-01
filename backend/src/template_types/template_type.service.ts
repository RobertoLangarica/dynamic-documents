import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TemplateType } from "./template_type.entity";
import { TemplateTypeDto } from "./template_type.dto";

@Injectable()
export class TemplateTypeService {
    constructor(@InjectRepository(TemplateType)
    private readonly ttype_repo: Repository<TemplateType>
    ) { }

    async findAll(): Promise<Object> {
        return { items: await this.ttype_repo.find() }
    }

    async findById(id: string): Promise<TemplateType> {
        let type = await this.ttype_repo.findOne(id)

        if (!type) {
            throw new NotFoundException()
        }

        return type
    }

    async findByNameOrCreate(name: string, create_new: boolean = false): Promise<TemplateType> {
        let type = await this.ttype_repo.findOne({ name: name })

        if (create_new && !type) {
            // New type
            type = await this.ttype_repo.create({ name: name })
            type = await this.ttype_repo.save(type)
        }

        return type
    }

    async deleteTemplateType(id: string) {
        let toDelete = await this.ttype_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.ttype_repo.delete({ id: id })
    }

    async addTemplateType(data: TemplateTypeDto): Promise<TemplateType> {
        let ttype = await this.ttype_repo.create(data)

        try {
            ttype = await this.ttype_repo.save(ttype)
            return ttype
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    async updateTemplateType(id: string, data: TemplateTypeDto) {
        // Prevent duplicated names
        let duplicated = await this.ttype_repo.createQueryBuilder('t')
            .where("t.name = :name AND t.id != :id ", { name: data.name, id: id })
            .getRawOne()

        if (duplicated) {
            throw new ConflictException(`There is an already existing template type with the name: ${data.name}`)
        }

        data['id'] = id;
        let type = await this.ttype_repo.preload(data)

        if (!type) {
            throw new HttpException('Unable to find the required template type', HttpStatus.NOT_FOUND)
        }

        type = await this.ttype_repo.save(type)
        return type
    }
}