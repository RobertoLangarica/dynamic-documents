import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsUUID, IsIP, IsBoolean, IsString } from 'class-validator';
import { User } from 'src/user/user.entity';
import { BasicEntity } from 'src/common/entities/basic.entity';
import { isIPv4 } from 'net';

const sha256 = require('sha256')

@Entity('secrets')
export class APISecret extends BasicEntity {

    @Column() @IsBoolean()
    active: boolean;

    @Column() @IsString()
    secret: string;

    @Column('uuid') @IsUUID()
    user_id: string

    @Column({ type: 'inet', nullable: true }) @IsIP()
    ip: string

    @ManyToOne(type => User, r => r.api_secret)
    @JoinColumn({ name: "user_id" })
    user: User;

    @BeforeInsert()
    hashSecret() {
        this.secret = sha256(this.secret)
    }

    @BeforeInsert()
    @BeforeUpdate()
    IPv4ToIPv6() {
        // Ipv4 is 32 bits long and IPv6 is 128 bits long
        this.ip = this.ip ? (this.ip !== '' ? this.ip : null) : null

        if (this.ip) {
            // Spliting mask
            let splited = this.ip.split("/")
            this.ip = splited[0]
            let mask = splited.length > 1 ? parseInt(splited[1]) : null

            if (isIPv4(this.ip)) {
                let v6_mask = "::ffff:"
                this.ip = v6_mask + this.ip + (mask ? ('/' + (mask + 96)) : ''); //Completting the missing bits in the mask for Ipv6
            } else if (mask) {
                //Returning the iPv6 with the mask provided
                this.ip = this.ip + "/" + mask
            }
        }
    }
}
