import { Module } from "@nestjs/common";
import { APISecretController } from "./api_secret.controller";
import { APISecretService } from "./api_secret.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APISecret } from "./api_secret.entity";

@Module({
    controllers: [APISecretController],
    providers: [APISecretService],
    imports: [TypeOrmModule.forFeature([APISecret])],
    exports:[APISecretService]

})
export class APISecretModule{}