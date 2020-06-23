import { Injectable, HttpException, Res, HttpStatus } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { APISecret } from './api_secret.entity'
import { Repository } from 'typeorm'
import * as uuid from 'uuid/v4'

@Injectable()
export class APISecretService {
    constructor(
        @InjectRepository(APISecret) 
        private readonly api_secretRepo: Repository<APISecret>
    ){}

    async disableActiveSecret(user_id:string, @Res() response?):Promise<void>{
        let secret = await this.api_secretRepo.findOne({ user_id:user_id, active: true })
        if(secret){
            secret.active = false;
            await this.api_secretRepo.save(secret)
        } else if(response){
            response.status(HttpStatus.NO_CONTENT)
        }
    }

    async addIPToActiveSecret(user_id:string, ip:string, @Res() response?):Promise<void>{
        let secret = await this.api_secretRepo.findOne({ user_id:user_id, active: true })
        if(secret){
            secret.ip = ip;
            await this.api_secretRepo.save(secret)
        } else if(response){
            response.status(HttpStatus.NO_CONTENT)
        }
    }

    async newActiveSecret(user_id:string, ip:string):Promise<void>{
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
}