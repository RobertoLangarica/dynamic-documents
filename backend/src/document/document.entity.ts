import { Entity, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { Type } from "class-transformer";
import { IsUUID, IsArray, IsString } from "class-validator";
import { Status } from "src/status/status.entity";
import { DocumentVersion } from "./dto/doc_version.dto";
import { Category } from "src/categories/category.entity";
import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Field } from "src/document/dto/field.dto";

@Entity('documents')
export class Document extends EntityWithTimeStampt {
    @Column() @IsString()
    name: string

    @Column({default:'uuid_generate_v4()'})
    type: string

    @Column({type:'boolean', default:false})
    is_template: boolean

    @Column({ default: '' }) @IsString()
    description: string

    @Column({ type: 'jsonb', default: [] })
    @Type(() => Field) @IsArray()
    fields: Field[]

    @Column({ type: 'uuid', nullable: true }) @IsUUID()
    source_id: string // Null if this document wasn't created as a copy of a document

    @ManyToOne(type => Status, { eager: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "status_id" })
    @Type(() => Status)
    status: Status

    @Column({ type: 'jsonb', default: [], select: false })
    @Type(() => DocumentVersion) @IsArray()
    versions: DocumentVersion[]

    @ManyToMany(type => Category, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'documents_categories',
        joinColumn: { name: 'document_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    @Type(() => Category) @IsArray()
    categories: Category[]

    @IsArray()
    warnings: string[] // Not saved in the DB
}