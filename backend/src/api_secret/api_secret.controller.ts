import { Controller, Patch, Body, Post, UseGuards } from "@nestjs/common";
import { User } from "src/user/user.entity";
import { APISecretService } from "./api_secret.service";
import { AddIPDTO } from "./dto/addip.dto";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/Auth.guard";

@ApiTags('Api secrets')
@Controller('secret')
@UseGuards(AuthGuard)
export class APISecretController {
    constructor(private readonly secret: APISecretService) {
    }

    @Patch('disable')
    disableActiveSecret(@Body('user') user: User): void {
        this.secret.disableActiveSecret(user.id)
    }

    @Patch('add-ip')
    addIPToActiveSecret(@Body('user') user: User, @Body() dto: AddIPDTO) {
        return this.secret.addIPToActiveSecret(user.id, dto.ip)
    }

    @Post('create')
    createSecret(@Body('user') user: User, @Body() dto: AddIPDTO) {
        return this.secret.newActiveSecret(user.id, dto.ip)
    }
}