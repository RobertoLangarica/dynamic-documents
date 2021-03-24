import { Module, forwardRef } from "@nestjs/common";
import { DocumentController } from "./document.controller";
import { DocumentService } from "./document.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Document } from "./document.entity";
import { CategoryModule } from "src/categories/category.module";
import { StatusModule } from "src/status/status.module";
import { DocumentFilterModule } from "src/document_filter/doc_filter.module";
import { FillmapModule } from "src/fillmaps/fillmap.module";

@Module({
    controllers: [DocumentController],
    providers: [DocumentService],
    imports: [TypeOrmModule.forFeature([Document]), CategoryModule, StatusModule, forwardRef(() => DocumentFilterModule), FillmapModule],
    exports: [DocumentService]
})
export class DocumentModule { }