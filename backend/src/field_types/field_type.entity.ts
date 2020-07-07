import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { IsJSON, IsArray, IsString } from "class-validator";
import { Validation } from "../validations/validation.entity";
import { Type } from "class-transformer";

@Entity('field_types')
export class FieldType extends SimpleEntity {
    @Column() @IsString()
    controller: string;

    @Column({ type: 'jsonb', default: '{}' }) @IsJSON()
    parameters: string

    @ManyToMany(type => Validation, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'field_types_validations',
        joinColumn: { name: 'field_type_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'validation_id', referencedColumnName: 'id' }
    })
    @Type(() => Validation) @IsArray()
    validations: Validation[]
}