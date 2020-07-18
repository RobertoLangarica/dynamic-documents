import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { EntityWithTimeStampt } from 'src/common/entities/entity_with_timestampt.entity'

const sha256 = require('sha256')

@Entity('tokens')
export class Token extends EntityWithTimeStampt {

  @Column('uuid') user_id: string
  @Column() token: string

  @BeforeInsert()
  hashToken() {
    this.token = sha256(this.token)
  }
}
