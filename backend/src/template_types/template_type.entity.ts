import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { IsUUID, IsString } from "class-validator";

@Entity('template_types')
@Unique(['name'])
export class TemplateType {

    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;
}