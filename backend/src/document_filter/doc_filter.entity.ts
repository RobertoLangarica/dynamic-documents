import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Entity, Unique, Column } from "typeorm";
import { Type, Expose, Transform } from "class-transformer";
import { IsDate, IsString, IsUUID, IsArray, IsBoolean } from "class-validator";

export class FilterField {
    @IsUUID() @Expose()
    field: string

    @IsBoolean() @Expose()
    @Transform(value => {
        if (value === undefined) {
            return false
        }

        return value
    }, { toClassOnly: true })
    readonly: boolean = false
}

@Entity('document_filters')
@Unique(['name'])
export class DocumentFilter extends EntityWithTimeStampt {
    @Column() @IsString()
    name: string

    @Column({ type: 'uuid' }) @IsUUID()
    document: string

    @Column({ type: 'timestamptz', nullable: true, default: null }) @IsDate()
    expiration_date: string

    @Column({ default: '' }) @IsString()
    description: string

    @Column({ type: 'uuid' }) @IsUUID()
    owner: string

    @Column({ type: 'jsonb', default: [] })
    @Type(() => FilterField) @IsArray()
    fields: FilterField[]

    @Column({ default: false })
    expired: boolean
}