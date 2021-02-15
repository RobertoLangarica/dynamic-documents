import { PrimaryGeneratedColumn, Column, BeforeUpdate } from "typeorm";
import { IsUUID } from "class-validator";
import { Transform, TransformFnParams, Type } from "class-transformer";

export abstract class EntityWithTimeStampt {
    @PrimaryGeneratedColumn('uuid') @IsUUID()
    id: string

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    @Transform((params) => new Date(Date.parse(params.value)).toISOString(), { toClassOnly: true })
    created_at: string

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    @Transform((params) => new Date(Date.parse(params.value)).toISOString(), { toClassOnly: true })
    updated_at: string

    @BeforeUpdate()
    updatedAt() {
        this.updated_at = new Date(Date.now()).toISOString()
    }
}