import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { IsJSON, IsArray } from "class-validator";
import { Validation } from "../../validations/validation.entity";
import { Type } from "class-transformer";

@Entity('field_types')
export class FieldType extends SimpleEntity {
    @Column({ type: 'jsonb', default: '{}' }) @IsJSON()
    parameters: string

    @ManyToMany(type => Validation, { eager: true, onDelete: 'SET NULL' })
    @JoinTable({ name: 'types_validations', joinColumn: { name: 'validation', referencedColumnName: 'id' } })
    @Type(() => Validation) @IsArray()
    validations: Validation[]
}