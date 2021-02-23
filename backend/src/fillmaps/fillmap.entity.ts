import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { EntityWithTimeStampt } from "src/common/entities/entity_with_timestampt.entity";
import { Column, Entity, Index } from "typeorm";

export class FillmapField {
    @IsString() @IsNotEmpty()
    foreign: string
    @IsUUID() @IsNotEmpty()
    destination:string
}

@Entity('fillmaps')
@Index(['source_type','destination_type_id'],{ unique: true })
export class Fillmap extends  EntityWithTimeStampt{
    @Column()
    source_type:string

    @Column({ type: 'uuid' })
    destination_type_id:string

    @Column({ type: 'jsonb', default: [] })
    @Type(() => FillmapField)
    fields: FillmapField[]
}