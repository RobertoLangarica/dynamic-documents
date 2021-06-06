import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from "@nestjs/common"
import { Document } from "./document.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CreateDocumentDto, DocumentDto } from "./dto/document.dto"
import { User } from "src/user/user.entity"
import { StatusService } from "src/status/status.service"
import { DocumentConfig } from "./document.config"
import { DocumentFilterService } from "src/document_filter/doc_filter.service"
import { FDataDependent, Field } from "src/document/dto/field.dto"
import { v4 as uuidv4 } from 'uuid'
import { isNotEmpty } from "class-validator"
import { Fillmap } from "src/fillmaps/fillmap.entity"
import { FillmapService } from "src/fillmaps/fillmap.service"

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        public readonly doc_repo: Repository<Document>,
        private readonly status_service: StatusService,
        private readonly filter_service: DocumentFilterService,
        private readonly fillmap_service: FillmapService,
    ) { }

    async findAll(categories_query: any, status_query: any, includeTemplates:boolean = false, includeDocuments:boolean = true): Promise<Object> {
        let query = this.doc_repo.createQueryBuilder('doc')
            .select(['doc.id', 'doc.name'])
            .leftJoinAndSelect('doc.status', 's')
            .leftJoinAndSelect('doc.categories', 'c')

        if (status_query) {
            query.andWhere("(s.name = ANY(:snames) OR s.id = ANY(:sids))", { snames: status_query.names, sids: status_query.ids })
        }

        if (categories_query) {
            query.andWhere("(c.name = ANY(:cnames) OR c.id = ANY(:cids))", { cnames: categories_query.names, cids: categories_query.ids })
        }
        
        if (!includeTemplates) {
            query.andWhere(`doc.is_template = FALSE`)
        }

        if (!includeDocuments) {
            query.andWhere("doc.is_template = TRUE")
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
            .where("d.id = :id OR d.name = :id", { id: id_or_name })
            .getCount()

        return c > 0
    }

    async deleteDocument(id: string) {
        let toDelete = await this.doc_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        // delete fillmaps
         await this.fillmap_service.fillmap_repo.createQueryBuilder()
            .where('source_type = :id OR destination_type = :id',{id:id})
            .delete()
            .execute()
        
         // delete document
         await this.doc_repo.delete({ id: id })
    }

    async addDocument(data: CreateDocumentDto, isTemplate:boolean = false): Promise<Document> {
        //Initial status
        data.status = await this.status_service.findByName(DocumentConfig.initialState)
        data.is_template = isTemplate

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

    async addDocumentFromTemplate(data: CreateDocumentDto): Promise<Document> {
        //Initial status
        data.status = await this.status_service.findByName(DocumentConfig.initialState)

        let document = await this.doc_repo.create(data)

        // Read template
        let template = await this.findById(document.source_id, false)
        
        // type from the template
        document.type = template.type

        // TODO any field passed will be ignored, maybe we could do a merge
        document.fields = []

        for (let i = 0; i < template.fields.length; i++) {
            let src = template.fields[i]
            await this.copyField(document, src.id, template)
        }

        // The sorting order of the copied fields is probably not the original one
        let sorted: Field[] = []
        template.fields.forEach(src => {
            let field = document.fields.find(f => f.source_field === src.id)!
            field.sort_index = sorted.push(field)-1
        })

        document.fields = sorted

        // autofill the document using the incomming data
        if(data.autofill){
            // get fillmaps
            let fillmaps = (await this.fillmap_service.findBy('',template.id,true)).items

            data.autofill.forEach(auto=>{
                let fillmap = fillmaps.find(f=>f.source_type === auto.type)
                if(fillmap){
                    this.autoFill(fillmap, document, auto)
                }
            })
        }

        try {
            document = await this.doc_repo.save(document)
            // Creating a copy of the fillmaps with this document as destination
            let fillmaps:Fillmap[] = (await this.fillmap_service.findBy('',template.id, false)).items
            fillmaps = fillmaps.map(map=>{
                if(map.source_type === document.type){
                    map.source_type = document.id
                } 
                if(map.destination_type){
                    map.destination_type = document.id
                }
                delete map.id
                delete map.updated_at
                delete map.created_at
                return this.fillmap_service.fillmap_repo.create(map)
            })
            await this.fillmap_service.fillmap_repo.save(fillmaps)
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

    autoFill(fillmap:Fillmap, document:Document, data:{type:string, data:{[key:string]:any} }){
        fillmap.fields.forEach(map => {
            let src = data.data[map.foreign]
            let dest = document.fields.find(s => s.id === map.destination || s.map_id === map.destination)
            if (!!dest && !!src) {
                // Valid change
                dest.value = src
            }
          })
    }

    getReferencedField(from: Document, id: string) {
        // Returning the field if it exists
        let field = from.fields.find(f => f.id === id)
        if (field) {
            return field
        }

        // If source_field == id, means that this field is a copu of id and source_field is evidence of that
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
   * @param {*} source Document
   */
    async copyField(document: Document, idToCopy: string, source: Document) {
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

        // Adding the copy before any deep copy (to avoid circular references)
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
            // the group this field belongs to should be copied
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

                // Replacing the ids in the embedded value, for the new copied ids
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

        // If the field is a group then include group members in the copy
        if (this.isGroup(field)) {
            let inGroup = source.fields.filter(item => item.group_by === sourceField!.id)

            for (let i = 0; i < inGroup.length; i++) {
                let item = inGroup[i]
                let ref = this.getReferencedField(document, item.id)
                if (!ref) {
                    await this.copyField(document, item.id, source)
                    ref = this.getReferencedField(document, item.id)
                }

                ref!.group_by = field.id
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

        // Adding missing data to the newly created version
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

            // Adding the new ones 
            document.fields = document.fields.concat(toAdd)

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

            // Sorting all 
            document.fields = document.fields
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
}