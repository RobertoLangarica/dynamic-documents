import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm";
import { IsUUID, IsString } from "class-validator";
import { Template } from "src/templates/template.entity";

@Entity('template_types')
@Unique(['name'])
export class TemplateType {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;
}