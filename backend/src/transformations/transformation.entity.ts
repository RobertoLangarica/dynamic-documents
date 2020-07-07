import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { IsJSON } from "class-validator";
import { FieldType } from "src/field_types/field_type.entity";
import { Type } from "class-transformer";

@Entity('transformations')
export class Transformation extends SimpleEntity {
    @Column({ type: 'jsonb', default: '{}' }) @IsJSON()
    parameters: string

    @ManyToMany(type => FieldType, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'transformations_field_types',
        joinColumn: { name: 'transformation_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'field_type_id', referencedColumnName: 'id' }
    })
    @Type(() => FieldType)
    supported_types: FieldType[]
}