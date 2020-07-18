import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { IsUUID, IsString } from "class-validator";

@Entity('categories')
@Unique(['name'])
export class Category {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;
}