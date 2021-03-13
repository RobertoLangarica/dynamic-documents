import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('transformations')
export class Transformation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'jsonb', default: '{}' })
    parameters: {[key:string]:any}

}