import { Injectable, HttpException, HttpStatus, Body } from "@nestjs/common"
import { Document } from "./document.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { isUUID } from "class-validator"
import { DocumentDto } from "./dto/document.dto"
import { User } from "src/user/user.entity"
import { StatusService } from "src/status/status.service"

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(Document)
        private readonly doc_repo: Repository<Document>,
        private readonly status_service: StatusService
    ) { }

    async findAll(categories_query: any, status_query: any): Promise<Document[]> {
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

        return await query.getMany()
    }

    async findById(id: string): Promise<Document> {
        return await this.doc_repo.findOne({ id: id })
    }

    async deleteDocument(id: string) {
        await this.doc_repo.delete({ id: id })
    }

    async addDocument(data: DocumentDto): Promise<Document> {
        //Initial status
        data.status = await this.status_service.findByName('open')

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
        // avoiding the override of the existing fields by using preload
        let fields = data.fields;
        delete data.fields

        //avoiding the override of the existing versions
        let versions = data.versions
        delete data.versions
        let document = await this.doc_repo.preload(data)
        if (versions) document.versions.push(versions[0])
        if (data.categories) document.categories = data.categories

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

            for (let i = 0; i < document.fields.length; i++) {
                // Is there something to update?
                if (u < toUpdate.length && document.fields[i].id === toUpdate[u].id) {
                    document.fields[i] = Object.assign(document.fields[i], toUpdate[u])
                    u++;
                }

                // Is there something to delete?
                if (d < toDelete.length && document.fields[i].id === toDelete[d].id) {
                    document.fields.splice(i, 1)
                    i--;
                    d++;
                }

                if (u >= toUpdate.length && d >= toDelete.length) {
                    // There is nothing else to update or delete
                    break;
                }
            }
            document.fields = document.fields.concat(toAdd)
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