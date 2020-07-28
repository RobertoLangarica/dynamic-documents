import { PrimaryGeneratedColumn, Column, BeforeUpdate } from "typeorm";
import { IsUUID } from "class-validator";
import { Transform, Type } from "class-transformer";

export abstract class EntityWithTimeStampt {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    @Transform(value => new Date(value).toISOString(), { toClassOnly: true })
    created_at: string

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    @Transform(value => new Date(value).toISOString(), { toClassOnly: true })
    updated_at: string

    @BeforeUpdate()
    updatedAt() {
        this.updated_at = new Date(Date.now()).toISOString()
    }
}