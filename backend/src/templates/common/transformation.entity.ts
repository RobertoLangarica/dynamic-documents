import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { Entity, Column } from "typeorm";
import { IsJSON } from "class-validator";

@Entity('transformations')
export class Transformations extends SimpleEntity {
    @Column({ type: 'jsonb', default: '{}' }) @IsJSON()
    parameters: string
}