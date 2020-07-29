import { Entity, Column, ManyToOne, ManyToMany, JoinTable, Unique } from "typeorm";
import { Type } from "class-transformer";
import { IsUUID, IsArray, IsString } from "class-validator";
import { Status } from "src/status/status.entity";
import { DocumentVersion } from "./dto/doc_version.dto";
import { Category } from "src/categories/category.entity";
import { TemplateBaseEntity } from "src/templates/template_base.entity";

@Entity('documents')
@Unique(['name'])
export class Document extends TemplateBaseEntity {

    @Column({ type: 'uuid', nullable: true }) @IsUUID()
    template_source: string // Null if this document wasn't created using a template
    @Column({ type: 'uuid', nullable: true }) @IsUUID()
    document_source: string // Null if this document wasn't created as a copy of a document

    @ManyToOne(type => Status, { eager: true, onDelete: "SET NULL" })
    @Type(() => Status)
    status: Status

    @Column({ type: 'jsonb', default: [], select: false })
    @Type(() => DocumentVersion) @IsArray()
    versions: DocumentVersion[]

    @Column({ nullable: true }) @IsString()
    computed_capture: string //HTML precalculado para visualizar cuando solo se va consultar el documento
    @Column({ nullable: true }) @IsString()
    computed_print: string //HTML precalculado para visualizar como impresión

    @ManyToMany(type => Category, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'documents_categories',
        joinColumn: { name: 'document_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    @Type(() => Category) @IsArray()
    categories: Category[]
}