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
@Index(['source_type','destination_type'],{ unique: true })
export class Fillmap extends  EntityWithTimeStampt{
    @Column()
    source_type:string

    @Column()
    destination_type:string
    
    @Column({ type: 'jsonb', default: [] })
    @Type(() => FillmapField)
    fields: FillmapField[]
    
    @Column({default:false})
    autofill:boolean

    @Column()
    name:string
}