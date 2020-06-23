import { Controller, Patch, Body, Post } from "@nestjs/common";
import { User } from "src/user/user.entity";
import { APISecretService } from "./api_secret.service";
import { SecretDTO } from "./dto/secret.dto";

@Controller('secret')
export class APISecretController {
    constructor(private readonly secret:APISecretService){
    }

    @Patch('disable')
    disableActiveSecret(@Body('user') user: User){
        return this.secret.disableActiveSecret(user.id)
    }

    @Patch('add-ip')
    addIPToActiveSecret(@Body('user') user: User, @Body() dto:SecretDTO){
        return this.secret.addIPToActiveSecret(user.id, dto.ip)
    }

    @Post('create')
    createSecret(@Body('user') user: User, @Body() dto:SecretDTO){
        return this.secret.newActiveSecret(user.id, dto.ip)
    }
}