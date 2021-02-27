import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { FillmapController } from "./fillmap.controller";
import { Fillmap } from "./fillmap.entity";
import { FillmapService } from "./fillmap.service";

@Module({
    controllers: [FillmapController],
    providers: [FillmapService],
    imports: [TypeOrmModule.forFeature([Fillmap])],
    exports: [FillmapService]
})
export class FillmapModule { }
