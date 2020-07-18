import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemplateTypeController } from "./template_type.controller";
import { TemplateTypeService } from "./template_type.service";
import { TemplateType } from "./template_type.entity";

@Module({
    controllers: [TemplateTypeController],
    providers: [TemplateTypeService],
    imports: [TypeOrmModule.forFeature([TemplateType])],
    exports: [TemplateTypeService]
})
export class TemplateTypeModule { }