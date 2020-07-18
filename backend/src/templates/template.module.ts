import { Module } from "@nestjs/common";
import { TemplateService } from "./template.service";
import { TemplateController } from "./template.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Template } from "./template.entity";
import { TemplateTypeModule } from "src/template_types/template_type.module";
import { CategoryModule } from "src/categories/category.module";

@Module({
    controllers: [TemplateController],
    providers: [TemplateService],
    imports: [TypeOrmModule.forFeature([Template]), CategoryModule, TemplateTypeModule],
    exports: [TemplateService]
})
export class TemplateModule { }