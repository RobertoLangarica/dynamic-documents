import { Injectable, HttpException, HttpStatus, forwardRef, Inject, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DocumentFilter, FilterField } from "./doc_filter.entity";
import { CreateDocFilterDto, DocFilterDto } from "./doc_filter.dto";
import { Repository } from "typeorm";
import { User } from "src/user/user.entity";
import { DocumentService } from "src/document/document.service";
import { plainToClass } from "class-transformer";
import { CaptureDto } from "./capture.dto";
import { DocumentChange, DocumentVersion } from "src/document/dto/doc_version.dto";

@Injectable()
export class DocumentFilterService {
    constructor(
        @InjectRepository(DocumentFilter)
        public readonly filter_repo: Repository<DocumentFilter>,
        @Inject(forwardRef(() => DocumentService))
        private readonly doc_service: DocumentService
    ) { }

    async findAll(document_query: string, expired: boolean): Promise<Object> {

        let query = this.filter_repo.createQueryBuilder('f')

        if (document_query) {
            query.andWhere("(f.document = :d)", { d: document_query })
        }

        if (expired !== undefined) {
            query.andWhere("(f.expired = :e)", { e: expired })
        }
        let res = { items: await query.getMany() }
        console.log(res)
        return res
    }

    async findById(id: string): Promise<DocumentFilter> {
        let filter = await this.filter_repo.findOne({ id: id })

        if (!filter) {
            throw new NotFoundException()
        }

        return filter
    }

    async addFilter(data: CreateDocFilterDto, owner: User): Promise<DocumentFilter> {
        data.owner = owner.id
        let filter = await this.filter_repo.create(data)

        try {
            filter = await this.filter_repo.save(filter)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return filter
    }

    async deleteFilter(id: string) {
        let toDelete = await this.filter_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.filter_repo.delete({ id: id })
    }

    async updateFilter(id: string, data: DocFilterDto): Promise<DocumentFilter> {
        // Prevent duplicated names
        if (data.name) {
            let duplicated = await this.filter_repo.createQueryBuilder('f')
                .where("f.name = :name AND f.id != :id ", { name: data.name, id: id })
                .getRawOne()

            if (duplicated) {
                throw new ConflictException(`There is an already existing document filter with the name: ${data.name}`)
            }
        }

        data['id'] = id;
        let filter = await this.filter_repo.preload(data)

        if (!filter) {
            throw new HttpException('Unable to find the required document filter', HttpStatus.NOT_FOUND)
        }

        filter = await this.filter_repo.save(filter)
        return filter
    }

    async expire(id: string) {
        let filter = await this.filter_repo.findOne(id)

        if (!filter) {
            throw new NotFoundException()
        }

        filter.expired = true;
        return await this.filter_repo.save(filter)
    }

    async expireFromDoc(doc_id: string) {
        let filters = await this.filter_repo.find({ document: doc_id, expired: false })
        filters.forEach(f => f.expired = true)

        await this.filter_repo.save(filters)
    }

    async getFilteredDocument(id: string) {
        let filter = await this.filter_repo.findOneOrFail(id)
        let document = await this.doc_service.findById(filter.document)

        filter.fields = plainToClass(FilterField, filter.fields, { excludeExtraneousValues: true })

        let result = {
            id: id,
            fields: []
        };

        filter.fields.forEach(filter_field => {
            let field = document.fields.find(df => df.id == filter_field.field)

            if (field) {
                // the document.field.readonly has precedence over filter.field.readonly
                field.readonly = field.readonly ? field.readonly : filter_field.readonly
                result.fields.push(field)
            }
        })

        return result
    }

    async saveFilteredDocument(id: string, data: CaptureDto) {
        let filter = await this.filter_repo.findOneOrFail(id)
        let document = await this.doc_service.findById(filter.document, true)

        filter.fields = plainToClass(FilterField, filter.fields, { excludeExtraneousValues: true })
        data.fields = data.fields.map(f=>{
            return {
                // @ts-ignore
                field:f.id,
                value:f.value,
                added:false,
                deleted:false
            }
        })
        data.fields = plainToClass(DocumentChange, data.fields, { excludeExtraneousValues: true })

        //Saving the version for the document
        let version = new DocumentVersion()
        version.source_filter = id
        for (let d = 0; d < data.fields.length; d++) {
            let df = data.fields[d]
            let ff = filter.fields.find(f => f.field == df.field)

            // Any field not present in the filter is discarded
            // Any readonly field is discarded 
            if (ff && !ff.readonly) {
                let di = document.fields.findIndex(f => f.id == df.field)

                if (di >= 0) {
                    // TODO some validation

                    //Saving only real changes
                    if (document.fields[di].value !== df.value) {
                        document.fields[di].value = df.value

                        //Version
                        let change = new DocumentChange()
                        change.value = df.value;
                        change.field = df.field;
                        version.changes.push(change)
                    }
                }
            }
        }

        // Saving only if there is any change
        if (version.changes.length > 0) {
            document.versions.push(version)
            await this.doc_service.doc_repo.save(document)
        }

        // Returning the updated value
        let result = {
            id: id,
            fields: []
        };

        filter.fields.forEach(filter_field => {
            let field = document.fields.find(df => df.id == filter_field.field)

            if (field) {
                // the document.field.readonly has precedence over filter.field.readonly
                field.readonly = field.readonly ? field.readonly : filter_field.readonly
                result.fields.push(field)
            }
        })

        return result
    }
}