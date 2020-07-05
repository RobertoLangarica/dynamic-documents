import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator'
import { User } from './user.entity'
import { EntityWithTimeStampt } from 'src/common/entities/entity_with_timestampt.entity'

@Entity('grants')
export class Grant extends EntityWithTimeStampt {

  @Column('uuid') @IsUUID()
  user_id: string

  @Column({ type: 'uuid', nullable: true }) @IsUUID() @IsOptional()
  entity_id: string

  @Column() @IsString()
  name: string

  @ManyToOne(type => User, m => m.raw_grants)
  @JoinColumn({ name: 'user_id' })
  user: User
}
