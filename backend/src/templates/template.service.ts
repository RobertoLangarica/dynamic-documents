import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { isUUID } from "class-validator";
import { Template } from "./template.entity";
import { TemplateDto } from "./dto/template.dto";

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(Template)
        private readonly template_repo: Repository<Template>
    ) { }

    async findAll(categories_query: any): Promise<Template[]> {

        let query = this.template_repo.createQueryBuilder('tmp')
            .select(['tmp.id', 'tmp.name'])
            .leftJoinAndSelect('tmp.type', 't')
            .leftJoinAndSelect('tmp.categories', 'c')

        if (categories_query) {
            query.andWhere("(c.name = ANY(:cnames) OR c.id = ANY(:cids))", { cnames: categories_query.names, cids: categories_query.ids })
        }

        return await query.getMany()
    }

    async findById(id: string): Promise<Template> {
        return await this.template_repo.findOne({ id: id })
    }

    async deleteTemplate(id: string) {
        await this.template_repo.delete({ id: id })
    }

    async addTemplate(data: TemplateDto): Promise<Template> {
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
            let u = 0;
            let d = 0;

            for (let i = 0; i < template.fields.length; i++) {
                // Is there something to update?
                if (u < toUpdate.length && template.fields[i].id === toUpdate[u].id) {
                    template.fields[i] = Object.assign(template.fields[i], toUpdate[u])
                    u++;
                }

                // Is there something to delete?
                if (d < toDelete.length && template.fields[i].id === toDelete[d].id) {
                    template.fields.splice(i, 1)
                    i--;
                    d++;
                }

                if (u >= toUpdate.length && d >= toDelete.length) {
                    // There is nothing else to update or delete
                    break;
                }
            }
            template.fields = template.fields.concat(toAdd)
        }

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

}
