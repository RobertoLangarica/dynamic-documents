import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { APISecret } from './api_secret.entity'
import { Repository } from 'typeorm'
import { Request } from 'express'
import * as uuid from 'uuid/v4'
import { User } from 'src/user/user.entity'
const sha256 = require('sha256')

@Injectable()
export class APISecretService {
    constructor(
        @InjectRepository(APISecret)
        private readonly api_secretRepo: Repository<APISecret>
    ) { }

    async disableActiveSecret(user_id: string): Promise<void> {
        let secret = await this.api_secretRepo.findOne({ user_id: user_id, active: true })
        if (secret) {
            secret.active = false;
            await this.api_secretRepo.save(secret)
        }
    }

    async addIPToActiveSecret(user_id: string, ip: string): Promise<void> {
        let secret = await this.api_secretRepo.findOne({ user_id: user_id, active: true })
        if (secret) {
            secret.ip = ip;
            secret = await this.api_secretRepo.save(secret)
        }
    }

    async newActiveSecret(user_id: string, ip: string): Promise<void> {
        // disable any previous one
        await this.disableActiveSecret(user_id)

        let secret = this.api_secretRepo.create();
        let rawSecret = uuid();
        secret.secret = rawSecret;
        secret.ip = ip;
        secret.active = true;
        secret.user_id = user_id;
        await this.api_secretRepo.save(secret)

        return rawSecret;
    }

    async getUserFromSecret(req: Request, rawSecret: string): Promise<User> {
        if (!rawSecret) return null

        let api_secret = sha256(rawSecret)
        let client_ip = (req.header['x-forwarded-for'] || '').split(',').shift().trim() || req.connection.remoteAddress;

        let secret: APISecret = await this.api_secretRepo.createQueryBuilder('secret')
            .innerJoinAndSelect('secret.user', 'user')
            .where("(secret.secret=:secret AND secret.active AND secret.ip IS NULL) OR (secret.secret=:secret AND secret.active AND :client_ip <<= secret.ip)", { secret: api_secret, client_ip: client_ip })
            .getOne()

        if (secret) {
            return secret.user
        }

        return null
    }
} 