import { Entity, Unique, ManyToMany, JoinTable } from "typeorm";
import { IsArray } from "class-validator";
import { Category } from "src/categories/category.entity";
import { TemplateBaseEntity } from "src/templates/template_base.entity"
import { Type } from "class-transformer";

@Entity('templates')
@Unique(['name'])
export class Template extends TemplateBaseEntity {
    @ManyToMany(type => Category, { eager: true, onDelete: 'CASCADE' })
    @JoinTable({
        name: 'templates_categories',
        joinColumn: { name: 'template_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    @Type(() => Category) @IsArray()
    categories: Category[]
} 