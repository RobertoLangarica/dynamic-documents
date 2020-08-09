import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Template } from "./template.entity";
import { TemplateDto, CreateTemplateDto } from "./dto/template.dto";

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(Template)
        private readonly template_repo: Repository<Template>
    ) { }

    async findAll(categories_query: any): Promise<Object> {

        let query = this.template_repo.createQueryBuilder('tmp')
            .select(['tmp.id', 'tmp.name'])
            .leftJoinAndSelect('tmp.type', 't')
            .leftJoinAndSelect('tmp.categories', 'c')

        if (categories_query) {
            query.andWhere("(c.name = ANY(:cnames) OR c.id = ANY(:cids))", { cnames: categories_query.names, cids: categories_query.ids })
        }

        return { items: await query.getMany() }
    }

    async findById(id: string): Promise<Template> {
        let tmp = await this.template_repo.findOne({ id: id })

        if (!tmp) {
            throw new NotFoundException()
        }

        return tmp
    }

    async deleteTemplate(id: string) {
        let toDelete = await this.template_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.template_repo.delete({ id: id })
    }

    async addTemplate(data: CreateTemplateDto): Promise<Template> {
        let template = await this.template_repo.create(data)

        try {
            template = await this.template_repo.save(template)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
        template.warnings = data.warnings;

        return template
    }

    async updateTemplate(id: string, data: TemplateDto): Promise<Template> {
        // avoiding the override of the existing fields by using preload
        let fields = data.fields;
        delete data.fields
        data['id'] = id
        let template = await this.template_repo.preload(data)

        if (!template) {
            throw new HttpException('Unable to find the required template', HttpStatus.NOT_FOUND)
        }

        if (data.categories) template.categories = data.categories

        if (fields.length > 0) {
            // Fields is only a partial update
            // There could be fields to: update, delete or add
            let toUpdate = fields.filter(item => (!item.deleted && !item.is_new))
            let toDelete = fields.filter(item => item.deleted)
            let toAdd = fields.filter(item => item.is_new).map(item => {
                // we remove the is_new property before save
                delete item.is_new
                return item
            })

            // Deleting fields
            toDelete.forEach(item => {
                let i = template.fields.findIndex(f => f.id === item.id)

                if (i >= 0) {
                    template.fields.splice(i, 1)
                }
            })

            // Updating fields
            toUpdate.forEach(item => {
                let i = template.fields.findIndex(f => f.id === item.id)

                if (i < 0) {
                    return;
                }
                template.fields[i] = Object.assign(template.fields[i], item)
            })

            template.fields = template.fields.concat(toAdd)
        }

        try {
            template = await this.template_repo.save(template)
            template.warnings = data.warnings;
            return template
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

}
