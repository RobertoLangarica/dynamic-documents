import { BasicEntity } from "src/common/entities/basic.entity";
import { Column, Entity } from "typeorm";

@Entity('fields')
export class Field extends BasicEntity {
    type: string;
    hint: string;
    description: string;
    name: string;
    editable: boolean;
    embdeddable: string;
    embededdable: string;
    categories: string[];
    accepted_values: any[];
    validation_expression: string[]
    @Column({ nullable: true, default: () => null })
    value: string
}