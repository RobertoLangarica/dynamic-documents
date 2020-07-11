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

    async findAll(categories_query: string): Promise<Template[]> {

        // filtering by category
        if (categories_query && categories_query.length > 0) {
            let categories: string[] = categories_query.split(',')

            // Supporting names and IDS
            let ids = categories.filter(value => {
                return isUUID(value)
            })

            let names = categories.filter(value => {
                return !isUUID(value)
            })

            return await this.template_repo.createQueryBuilder('t')
                .leftJoinAndSelect('t.categories', 'c')
                .where("(c.id = ANY(:ids)) OR (c.name = ANY(:names))", { ids: ids, names: names })
                .getMany()

        }

        return await this.template_repo.find()
    }

    async findById(id: string): Promise<Template> {
        return await this.template_repo.findOne({ id: id })
    }

    async deleteTemplate(id: string) {
        await this.template_repo.delete({ id: id })
    }

    async addTemplate(data: TemplateDto): Promise<Template> {
        let template = await this.template_repo.create(data)
        if (data.type) template.type = data.type
        if (data.categories) template.categories = data.categories

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
        let template = await this.template_repo.findOne(id)

        if (data.name) template.name = data.name
        if (data.type) template.type = data.type
        if (data.description) template.description = data.description
        if (data.categories) template.categories = data.categories
        if (data.fields.length > 0) {
            // Fields is only a partial update
            let fields = data.fields

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
                    template.fields[i] = toUpdate[u];
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
