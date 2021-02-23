import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { TemplateTypeModule } from "src/template_types/template_type.module";
import { FillmapController } from "./fillmap.controller";
import { Fillmap } from "./fillmap.entity";
import { FillmapService } from "./fillmap.service";

@Module({
    controllers: [FillmapController],
    providers: [FillmapService],
    imports: [TypeOrmModule.forFeature([Fillmap]), TemplateTypeModule],
    exports: [FillmapService]
})
export class FillmapModule { }
