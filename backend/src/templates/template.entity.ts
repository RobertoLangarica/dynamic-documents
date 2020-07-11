import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Entity, Column, Unique, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { IsString, IsArray } from "class-validator";
import { TemplateType } from "src/template_types/template_type.entity";
import { Field } from "./dto/field.dto";
import { Category } from "src/categories/category.entity";
import { Type, Exclude } from "class-transformer";

@Entity('templates')
@Unique(['name'])
export class Template extends EntityWithTimeStampt {

    @Column() @IsString()
    name: string

    @ManyToOne(type => TemplateType, { eager: true, onDelete: "SET NULL" })
    @Type(() => TemplateType)
    type: TemplateType

    @Exclude()
    get typeName() { return this.type.name }

    @Column({ default: '' }) @IsString()
    description: string

    @Column({ type: 'jsonb', default: [] })
    @Type(() => Field) @IsArray()
    fields: Field[]

    @ManyToMany(type => Category, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'templates_categories',
        joinColumn: { name: 'template_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    @Type(() => Category) @IsArray()
    categories: Category[]

    @Exclude() @IsArray()
    warnings: string[] // Not saved in the DB

} 