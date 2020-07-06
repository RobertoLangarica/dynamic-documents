import { Entity, Column } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";
import { IsString } from "class-validator";

@Entity('validations')
export class Validation extends SimpleEntity {
    @Column() @IsString()
    regex: string

    @Column() @IsString()
    error_message: string
}