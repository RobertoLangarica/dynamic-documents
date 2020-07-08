import { Entity, Column } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { IsString, IsJSON } from "class-validator";

@Entity('validations')
export class Validation extends SimpleEntity {
    @Column() @IsString()
    action: string

    @Column() @IsString()
    error_message: string

    @Column({ type: 'jsonb', default: '{}', nullable: true }) @IsJSON()
    parameters: string
}