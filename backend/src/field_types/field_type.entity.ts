import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { IsJSON, IsArray, IsString, IsOptional, IsNumber } from "class-validator";
import { Validation } from "../validations/validation.entity";
import { Type } from "class-transformer";

@Entity('field_types')
export class FieldType extends SimpleEntity {

    @Column() @IsString() @IsOptional()
    category

    @Column() @IsNumber() @IsOptional()
    order

    @Column() @IsString()
    component

    /**
     * Any parameter for the component.
     * It is also posible to override properties from the field by providing field_override.
     *      Eg. {#any parameter#, field_override:{readonly:true}}
     * The previous example with force the created field to be readonly after being created.
     */
    @Column({ type: 'jsonb', default: '{}' }) @IsJSON()
    parameters

    @ManyToMany(type => Validation, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'field_types_validations',
        joinColumn: { name: 'field_type_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'validation_id', referencedColumnName: 'id' }
    })
    @Type(() => Validation) @IsArray()
    validations: Validation[]
}
