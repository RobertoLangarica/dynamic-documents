import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Entity, Unique, Column } from "typeorm";
import { Type, Expose, Transform, Exclude } from "class-transformer";
import { IsString, IsUUID, IsArray, IsBoolean } from "class-validator";

@Exclude()
export class FilterField {
    @IsUUID() @Expose()
    field: string

    @IsBoolean() @Expose()
    @Transform(params => {
        if (params === undefined) {
            return false
        }
        return params.value
    }, { toClassOnly: true })
    readonly: boolean = false
}

@Entity('document_filters')
@Unique(['name'])
export class DocumentFilter extends EntityWithTimeStampt {
    @Column() @IsString()
    name: string

    @Column({ type: 'uuid' }) @IsUUID()
    document_id: string

    @Column({ type: 'timestamptz', nullable: true, default: null })
    @Transform(params => new Date(Date.parse(params.value)).toISOString(), { toClassOnly: true })
    expiration_date: string

    @Column({ default: '' }) @IsString()
    description: string

    @Column({ type: 'uuid' }) @IsUUID()
    owner_id: string

    @Column({ type: 'jsonb', default: [] })
    @Type(() => FilterField) @IsArray()
    fields: FilterField[]

    @Column({ default: false })
    expired: boolean
}