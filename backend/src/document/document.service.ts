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
import { Template } from "src/templates/template.entity"
import { FDataDependent, Field } from "src/templates/dto/field.dto"
import { v4 as uuidv4 } from 'uuid'
import { isNotEmpty } from "class-validator"

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

    async findById(id: string, includeVersions:boolean = false): Promise<Document> {
        let query = this.doc_repo.createQueryBuilder('d')
        if(includeVersions){
            query.addSelect('d.versions')
        }
        query.leftJoinAndSelect('d.status','name')
        query.where('d.id=:id', { id: id })

        let doc = await query.getOne()

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

    async addDocumentFromTemplate(data: DocumentDto): Promise<Document> {
        //Initial status
        data.status = await this.status_service.findByName(DocumentConfig.initialState)

        let document = await this.doc_repo.create(data)

        // Read the template
        let template = await this.template_service.findById(document.template_source)
        document.fields = [] // TODO any field passed will be ignored, maybe a merge

        for (let i = 0; i < template.fields.length; i++) {
            let src = template.fields[i]
            await this.copyField(document, src.id, template)
        }

        // The sorting order of the copied fields is probably not the original one
        let sorted: Field[] = []
        template.fields.forEach(src => {
            sorted.push(document.fields.find(f => f.source_field === src.id)!)
        })

        document.fields = sorted

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

    getReferencedField(from: Document, id: string) {
        let field = from.fields.find(f => f.id === id)

        if (field) {
            return field
        }

        field = from.fields.find(f => f.source_field === id)

        return field
    }

    simpleFieldCopy(sourceField: Field): Field {
        let field = Object.assign({}, sourceField, { source_field: sourceField.id, id: uuidv4() })
        if (!sourceField.map_id) {
            field.map_id = sourceField.id
        }
        // Any relation is set to blank
        field.use_embedded = false
        delete field.dependent
        delete field.source_template
        delete field.source_document
        delete field.group_by
        delete field.embedded_fields
        delete field.replicate_with

        return field
    }

    isGroup(field: Field): boolean {
        return field.type.name === 'Grupo'
    }

    /**
   *
   * @param {*} idToCopy UUID
   * @param {*} source Template
   * @param {*} includeGroupChildren true: The copy include the children, false: No children is copied with this action
   */
    async copyField(document: Document, idToCopy: string, source: Template, includeGroupChildren = false) {
        let sourceField: Field | undefined
        let field: Field

        // avoiding double copies
        sourceField = this.getReferencedField(document, idToCopy)
        if (sourceField) {
            // already copied
            return
        }

        // Copy
        sourceField = source.fields.find(f => f.id === idToCopy)
        if (!sourceField) {
            // The specified field to copy is not present in the source
            return
        }
        // Copy the field
        field = this.simpleFieldCopy(sourceField)


        field.source_template = source.id

        // Adding the copy before any deep copy (to avoid circular references)
        field.sort_index = document.fields.length
        document.fields.push(field)

        // Dependent
        if (sourceField.dependent && isNotEmpty(sourceField.dependent.on)) {
            let ref = this.getReferencedField(document, sourceField.dependent.on)
            if (!ref) {
                await this.copyField(document, sourceField.dependent.on, source)
                ref = this.getReferencedField(document, sourceField.dependent.on)
            }
            field.dependent = new FDataDependent()
            field.dependent.on = ref!.id
            field.dependent.accepted_values = sourceField.dependent.accepted_values
        }

        // Group
        if (isNotEmpty(sourceField.group_by)) {
            // the group should be copied
            let ref = this.getReferencedField(document, sourceField.group_by!)
            if (!ref) {
                await this.copyField(document, sourceField.group_by!, source)
                ref = this.getReferencedField(document, sourceField.group_by!)
            }
            field.group_by = ref!.id
        }

        // Embedded fields
        if (sourceField.use_embedded) {
            field.embedded_fields = []
            for (let i = 0; i < sourceField.embedded_fields!.length; i++) {
                let item = sourceField.embedded_fields![i]
                let ref = this.getReferencedField(document, item)
                if (!ref) {
                    await this.copyField(document, item, source)
                    ref = this.getReferencedField(document, item)
                }

                field.embedded_fields.push(ref!.id)

                // TODO validate if this works for every embedded case
                let regexp = new RegExp(item, 'gi')
                field.value = String(field.value).replace(regexp, ref!.id)
            }

            field.use_embedded = field.embedded_fields.length > 0
        }

        // Duplicate anchor
        if (isNotEmpty(sourceField.replicate_with)) {
            let ref = this.getReferencedField(document, sourceField.replicate_with!)
            if (!ref) {
                await this.copyField(document, sourceField.replicate_with!, source)
                ref = this.getReferencedField(document, sourceField.replicate_with!)
            }
            field.replicate_with = ref!.id
        }

        // Include group members in the copy
        if (includeGroupChildren && this.isGroup(field)) {
            let inGroup = source.fields.filter(item => item.group_by === sourceField!.id)

            for (let i = 0; i < inGroup.length; i++) {
                let item = inGroup[i]
                let ref = this.getReferencedField(document, item.id)
                if (!ref) {
                    await this.copyField(document, item.id, source)
                    ref = this.getReferencedField(document, item.id)
                }

                if (ref!.group_by !== field.id) {
                    ref!.group_by = field.id
                }
            }
        }
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

        // Completing the new version before using preload (that rewrites it)
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