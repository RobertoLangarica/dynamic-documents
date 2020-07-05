import { BasicEntity } from "src/common/entities/basic.entity";
import { Column, Entity } from "typeorm";

@Entity('fields')
export class Field extends BasicEntity {
    @Column()
    type: string;

    @Column({ default: () => "" })
    hint: string;

    @Column({ default: () => "" })
    description: string;

    @Column({ default: () => "" })
    name: string;

    @Column()
    editable: boolean;

    @Column()
    embededdable: boolean; // A field is only embeddable if it has no children

    @Column()
    categories: string[];

    @Column()
    accepted_values: any[];

    @Column()
    validation_expression: string[]

    @Column({ nullable: true, default: () => null })
    value: string

    @Column({ nullable: true })
    default_value: string

    //relacion
    fields: Field[]
}