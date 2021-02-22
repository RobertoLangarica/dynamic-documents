import { CanActivate, ExecutionContext, Injectable, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { isUUID } from "class-validator";
import { DocumentConfig } from "src/document/document.config";
import { DocumentFilterService } from "src/document_filter/doc_filter.service";
import { DocumentService } from "src/document/document.service";

@Injectable()
export class DocumentFilterCanCaptureGuard implements CanActivate {
    constructor(
        private readonly doc_service: DocumentService,
        private readonly filter_service: DocumentFilterService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        let id = request.params['id'];

        if (!isUUID(id)) {
            throw new BadRequestException('Validation failed (uuid  is expected)')
        }

        let filter_repo = this.filter_service.filter_repo;
        let doc_repo = this.doc_service.doc_repo;

        let filter = await filter_repo.createQueryBuilder('f')
            .select(['f.id', 'f.document_id'])
            .where("f.id = :id", { id: id })
            .getOne()

        if (!filter) {
            throw new HttpException('Unable to find the specified document filter', HttpStatus.NOT_FOUND)
        }

        let document = await doc_repo.createQueryBuilder('d')
            .select('d.id')
            .leftJoinAndSelect('d.status', 's')
            .where("d.id = :id", { id: filter.document_id })
            .getOne()

        if (!document) {
            throw new HttpException('Unable to find the specified document', HttpStatus.NOT_FOUND)
        }

        return DocumentConfig.canBeCaptured(document.status.name)
    }

}