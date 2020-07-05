import { PrimaryGeneratedColumn, Column } from "typeorm";
import { IsString, IsUUID } from "class-validator";

export abstract class SimpleEntity {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;

    @Column() @IsString()
    description: string
}