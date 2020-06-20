import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from 'typeorm';
import { IsUUID, IsIP, IsBoolean } from 'class-validator';
import { User } from 'src/user/user.entity';


@Entity()
export class APISecret {

    @PrimaryGeneratedColumn("uuid") @IsUUID()
    id: string;

    @Column("uuid") @IsUUID()
    value: string;

    @Column('inet') @IsIP(4)
    ip:string

    @Column() @IsBoolean()
    active: boolean;    

    @ManyToOne(type => User, r => r.api_secret)
    user: string;
}
