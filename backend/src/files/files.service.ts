import { Injectable, NotFoundException } from "@nestjs/common";
import { DocumentService } from "src/document/document.service";
import { PDFService } from "./pdf.service";
import { StorageService } from "./storage.service";

@Injectable()
export class FilesService {
    constructor(
        private readonly doc_service: DocumentService,
        private readonly storage_service: StorageService,
        private readonly pdf_service: PDFService
    ) { }
    
    async getFile(id:string, format:string = 'pdf'):Promise<Buffer>{
        let document = await this.doc_service.findById(id,true)
        let expectedVersion = document.versions.length > 0 ? document.versions[document.versions.length-1].id : document.id

        // Remove any previous version
        await this.storage_service.deleteFileVersions(document.id, expectedVersion)

        let file:Buffer
        if(!(await this.storage_service.exists(document.id, expectedVersion))){
            console.log('Unexisting file')
            // We have to create the file
            file = await this.pdf_service.createFromDocument(document)
            // Save to the remote service
            await this.storage_service.saveFile(document.id, expectedVersion, file)
        } else {
            console.log('Existing file')
            // We get the file
            file = await this.storage_service.getFile(document.id, expectedVersion)
        }

        if(!file){
            throw new NotFoundException('Unable to find the expected PDF')
        }

        return file
    }
}