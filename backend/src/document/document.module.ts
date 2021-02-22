import { Module, forwardRef } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Document } from "./document.entity";
import { CategoryModule } from "src/categories/category.module";
import { TemplateTypeModule } from "src/template_types/template_type.module";
import { StatusModule } from "src/status/status.module";
import { DocumentFilterModule } from "src/document_filter/doc_filter.module";

@Module({
    controllers: [DocumentController],
    providers: [DocumentService],
    imports: [TypeOrmModule.forFeature([Document]), CategoryModule, TemplateTypeModule, StatusModule, forwardRef(() => DocumentFilterModule)],
    exports: [DocumentService]
})
export class DocumentModule { }