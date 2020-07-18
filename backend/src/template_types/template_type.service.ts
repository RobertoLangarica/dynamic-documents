import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TemplateType } from "./template_type.entity";
import { TemplateTypeDto } from "./template_type.dto";

@Injectable()
export class TemplateTypeService {
    constructor(@InjectRepository(TemplateType)
    private readonly ttype_repo: Repository<TemplateType>
    ) { }

    async findAll(): Promise<TemplateType[]> {
        return await this.ttype_repo.find()
    }

    async findById(id: string): Promise<TemplateType> {
        return await this.ttype_repo.findOne(id)
    }

    async findByName(name: string, create_new: boolean = false): Promise<TemplateType> {
        let type = await this.ttype_repo.findOne({ name: name })

        if (create_new && !type) {
            // New type
            type = await this.ttype_repo.create({ name: name })
            await this.ttype_repo.save(type)
        }

        return type
    }

    async deleteTemplateType(id: string) {
        await this.ttype_repo.delete({ id: id })
    }

    async addTemplateType(data: TemplateTypeDto): Promise<TemplateType> {
        let ttype = await this.ttype_repo.create(data)

        try {
            ttype = await this.ttype_repo.save(ttype)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return ttype
    }

    async updateTemplateType(id: string, data: TemplateTypeDto) {
        await this.ttype_repo.update(id, { name: data.name })
    }
}