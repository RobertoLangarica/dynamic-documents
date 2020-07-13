import { Module, forwardRef } from "@nestjs/common";
import { DocumentFilterController } from "./doc_filter.controller";
import { DocumentFilterService } from "./doc_filter.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentFilter } from "./doc_filter.entity";
import { DocumentModule } from "src/document/document.module";

@Module({
    controllers: [DocumentFilterController],
    providers: [DocumentFilterService],
    imports: [TypeOrmModule.forFeature([DocumentFilter]), forwardRef(() => DocumentModule)],
    exports: [DocumentFilterService]
})
export class DocumentFilterModule { }