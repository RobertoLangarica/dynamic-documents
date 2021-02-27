import { Module } from "@nestjs/common";
import { TemplateController } from "./template.controller";
import { DocumentModule } from "src/document/document.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Document } from "src/document/document.entity";
import { CategoryModule } from "src/categories/category.module";

@Module({
    controllers: [TemplateController],
    imports: [TypeOrmModule.forFeature([Document]), DocumentModule, CategoryModule],
})
export class TemplateModule { }