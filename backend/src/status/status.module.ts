import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatusController } from "./status.controller";
import { StatusService } from "./status.service";
import { Status } from "./status.entity";

@Module({
    controllers: [StatusController],
    providers: [StatusService],
    imports: [TypeOrmModule.forFeature([Status])],
    exports: [StatusService]
})
export class StatusModule { }