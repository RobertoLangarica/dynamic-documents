import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesService } from './files.service';
import { DocumentModule } from 'src/document/document.module';
import { FilesController } from './files.controller';
import { PDFService } from './pdf.service';

@Module({
    imports:[DocumentModule],
    controllers: [FilesController],
    providers: [ FilesService ,StorageService, PDFService],
    exports:[FilesService]
})
export class FilesModule {}
