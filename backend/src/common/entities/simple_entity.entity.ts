import { PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { IsString, IsUUID } from "class-validator";

@Unique(['name'])
export abstract class SimpleEntity {

    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;

    @Column({ default: '' }) @IsString()
    description: string
}
