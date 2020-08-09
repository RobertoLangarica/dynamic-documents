import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from "@nestjs/common"
import { Document } from "./document.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { DocumentDto } from "./dto/document.dto"
import { User } from "src/user/user.entity"
import { StatusService } from "src/status/status.service"
import { DocumentConfig } from "./document.config"
import { DocumentFilterService } from "src/document_filter/doc_filter.service"
import { TemplateService } from "src/templates/template.service"

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        public readonly doc_repo: Repository<Document>,
        private readonly status_service: StatusService,
        private readonly filter_service: DocumentFilterService,
        private readonly template_service: TemplateService
    ) { }

    async findAll(categories_query: any, status_query: any): Promise<Object> {
        let query = this.doc_repo.createQueryBuilder('doc')
            .select(['doc.id', 'doc.name'])
            .leftJoinAndSelect('doc.type', 't')
            .leftJoinAndSelect('doc.status', 's')
            .leftJoinAndSelect('doc.categories', 'c')

        if (status_query) {
            query.andWhere("(s.name = ANY(:snames) OR s.id = ANY(:sids))", { snames: status_query.names, sids: status_query.ids })
        }

        if (categories_query) {
            query.andWhere("(c.name = ANY(:cnames) OR c.id = ANY(:cids))", { cnames: categories_query.names, cids: categories_query.ids })
        }

        return { items: await query.getMany() }
    }

    async findById(id: string): Promise<Document> {
        let doc = await this.doc_repo.findOne({ id: id })
        if (!doc) {
            throw new NotFoundException()
        }

        return doc
    }

    async exists(id_or_name: string): Promise<boolean> {
        let c = await this.doc_repo.createQueryBuilder("d")
            .where("d.id = :id", { id: id_or_name })
            .getCount()

        return c > 0
    }

    async getIDFromName(name: string) {
        return await this.doc_repo.createQueryBuilder('d')
            .select('d.id')
            .where('d.name = :name', { name: name })
            .getOne()
    }

    async deleteDocument(id: string) {
        let toDelete = await this.doc_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.doc_repo.delete({ id: id })
    }

    async addDocument(data: DocumentDto): Promise<Document> {
        //Initial status
        data.status = await this.status_service.findByName(DocumentConfig.initialState)

        let document = await this.doc_repo.create(data)

        try {
            document = await this.doc_repo.save(document)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
        document.warnings = data.warnings;

        return document
    }

    async setStatus(id: string, new_status: string) {
        let status = await this.status_service.findByName(new_status)
        let document

        if (status) {
            document = await this.doc_repo.findOneOrFail(id)
            document.status = status
            document = await this.doc_repo.save(document)

            if (!DocumentConfig.canBeCaptured(new_status)) {
                // Expire open DocumentFilters
                await this.filter_service.expireFromDoc(id)
            }

        } else {
            throw new BadRequestException(`Status ${new_status} can't be recognized.`)
        }

        return document
    }

    async updateDocument(id: string, data: DocumentDto, user: User): Promise<Document> {

        // Completing the version info before preload
        if (data.versions && data.versions.length > 0) {
            data.versions[0].source_filter = null;
            data.versions[0].source_user = user.id;
        }

        data['id'] = id
        return await this.saveDocumentChanges(data)
    }

    async saveDocumentChanges(data: DocumentDto): Promise<Document> {
        // avoiding the override of the existing fields
        let fields = data.fields;
        delete data.fields

        //avoiding the override of the existing versions
        let versions = data.versions
        delete data.versions
        let document = await this.doc_repo.createQueryBuilder('d')
            .addSelect('d.versions')
            .leftJoinAndSelect('d.status', 's')
            .where('d.id=:id', { id: data.id })
            .getOne()

        if (!document) {
            throw new NotFoundException()
        }

        // Assigning present changes in data
        Object.assign(document, data)

        if (versions) document.versions.push(versions[0])

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
                let i = document.fields.findIndex(f => f.id === item.id)

                if (i >= 0) {
                    document.fields.splice(i, 1)
                }
            })

            // Updating fields
            toUpdate.forEach(item => {
                let i = document.fields.findIndex(f => f.id === item.id)

                if (i < 0) {
                    return;
                }
                document.fields[i] = Object.assign(document.fields[i], item)
            })

            // TODO maybe we could trust on the incomming sort_index
            // adding and sorting fields
            document.fields = document.fields
                .concat(toAdd)
                .sort((a, b) => a.sort_index - b.sort_index)
                .map((value, index) => {
                    value.sort_index = index
                    return value
                })

        }

        try {
            document = await this.doc_repo.save(document)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        document.warnings = data.warnings;

        return document
    }

    async clone(id_from: string) {
        let clone

        // from a document
        clone = await this.doc_repo.findOne(id_from)

        if (!clone) {
            // from a template
            clone = await this.template_service.findById(id_from)
            clone.template_source = id_from;
            clone.document_source = null;
        } else {
            clone.document_source = id_from
        }

        // Properties that should be autogenerated
        delete clone.id;
        delete clone.created_at
        delete clone.updated_at

        // Cloned name
        clone.name = `Copy from (${clone.name}) ` + (new Date(Date.now()).toISOString())
        //Initial status
        clone.status = await this.status_service.findByName(DocumentConfig.initialState)

        //Empty versions
        clone.versions = []

        clone = await this.doc_repo.create(clone)
        return await this.doc_repo.save(clone)
    }
}