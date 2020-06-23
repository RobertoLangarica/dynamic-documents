import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate} from 'typeorm';
import { IsUUID, IsIP, IsBoolean, IsString } from 'class-validator';
import { User } from 'src/user/user.entity';
import { BasicEntity } from 'src/common/entities/basic.entity';

const sha256 = require('sha256')

@Entity('secrets')
export class APISecret extends BasicEntity {

    @Column() @IsBoolean()
    active: boolean;    

    @Column() @IsString()
    secret: string;

    @Column('uuid') @IsUUID()
    user_id:string

    @Column({type:'inet', nullable:true}) @IsIP()
    ip:string

    @ManyToOne(type => User, r => r.api_secret)
    @JoinColumn({name: "user_id"})
    user: string;

    @BeforeInsert()
    hashSecret() {
        this.secret = sha256( this.secret)
    }
}
