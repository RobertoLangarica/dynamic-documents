import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { isUUID, isJSON } from "class-validator";
import { Template } from "./template.entity";
import { CategoryService } from "src/categories/category.service";
import { TemplateDto } from "./dto/template.dto";
import { Field } from "./dto/field.dto";
import { plainToClass } from "class-transformer";
import { TemplateTypeService } from "src/template_types/template_type.service";

@Injectable()
export class TemplateService {
    constructor(
        @InjectRepository(Template)
        private readonly template_repo: Repository<Template>,
        private readonly category_service: CategoryService,
        private readonly template_type_service: TemplateTypeService
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

        if (data.fields) template.fields = this.getFormattedFields(data.fields)
        if (data.type) template.type = await this.getTypeByName(data.type)
        if (data.categories) template.categories = await this.getCategoriesIDs(data) as any[]

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

        return template
    }

    async updateTemplate(id: string, data: TemplateDto): Promise<Template> {
        let template = await this.template_repo.findOne(id)

        if (data.name) template.name = data.name
        if (data.type) template.type = await this.getTypeByName(data.type)
        if (data.description) template.description = data.description
        if (data.categories) template.categories = await this.getCategoriesIDs(data) as any[]
        if (data.fields) {
            // Fields is only a partial update
            let fields = this.getFormattedFields(data.fields);

            // There could be fields to: update, delete or add
            let toUpdate = fields.filter(item => (!item.deleted && !item.is_new))
            let toDelete = fields.filter(item => item.deleted)
            let toAdd = fields.filter(item => item.is_new)
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

        return template
    }

    getFormattedFields(stringFormatted: any[]): Field[] {
        let fields: Field[]

        fields = stringFormatted.map((field, index) => {
            if (!isJSON(field)) {
                throw new HttpException(`Bad JSON format on fields[${index}]`, HttpStatus.BAD_REQUEST)
            }

            let f = plainToClass(Field, field, { excludeExtraneousValues: true })

            if (!f.id) {
                throw new HttpException(`Missing id property on fields[${index}]`, HttpStatus.BAD_REQUEST)
            }

            return f
        })

        return fields
    }

    async getTypeByName(type) {
        if (isUUID(type)) {
            return type
        }

        // Get or create a new type for the template
        return await this.template_type_service.findByName(type, true)
    }

    async getCategoriesIDs(data: TemplateDto): Promise<Object[]> {
        if (data.categories.length > 0) {
            // Name or IDs are supported
            let names = []
            let ids = []

            data.categories.forEach(item => {
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
                ids = ids.concat(await this.category_service.getIDsFromNames(names, true))
            }

            return ids
        }
        return []
    }
}
