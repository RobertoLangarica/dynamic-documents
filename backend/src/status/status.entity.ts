import { Entity, PrimaryGeneratedColumn, Column, Unique } from "typeorm";
import { IsUUID, IsString } from "class-validator";

@Entity('status')
@Unique(['name'])
export class Status {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string;

    @Column() @IsString()
    name: string;
}