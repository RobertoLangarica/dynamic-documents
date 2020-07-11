import { Entity, Column } from "typeorm";
import { Template } from "src/templates/template.entity";
import { Expose } from "class-transformer";
import { IsUUID } from "class-validator";

@Entity('documents')
export class Document extends Template {
    @Column({ type: 'uuid', nullable: true }) @Expose() @IsUUID()
    template_source: string // Null if this document wasn't created using a template
    @Column({ type: 'uuid', nullable: true }) @Expose() @IsUUID()
    document_source: string // Null if this document wasn't created as a copy of a document

    status: string
    versions: []

    @Column()
    computed_capture: string //HTML precalculado para visualizar cuando solo se va consultar el documento
    computed_print: string //HTML precalculado para visualizar como impresión
}