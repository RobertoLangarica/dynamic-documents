import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Column, ManyToOne } from "typeorm";
import { IsString, IsArray } from "class-validator";
import { TemplateType } from "src/template_types/template_type.entity";
import { Field } from "./dto/field.dto";
import { Type, Exclude } from "class-transformer";

export class TemplateBaseEntity extends EntityWithTimeStampt {

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

    @Exclude() @IsArray()
    warnings: string[] // Not saved in the DB

} 