import { CanActivate, Injectable, ExecutionContext, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DocumentFilter } from "src/document_filter/doc_filter.entity";
import { Repository } from "typeorm";
import { isUUID } from "class-validator";

@Injectable()
export class DocumentFilterExpiredGuard implements CanActivate {
    constructor(
        @InjectRepository(DocumentFilter)
        private readonly filter_repo: Repository<DocumentFilter>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        let id = request.params['id'];

        if (!isUUID(id)) {
            throw new BadRequestException('Validation failed (uuid  is expected)')
        }

        let filter = await this.filter_repo.createQueryBuilder('f')
            .select(['f.id', 'f.expiration_date', 'f.expired'])
            .where("f.id = :id", { id: id })
            .getOne()

        if (!filter) {
            throw new HttpException('Unable to find the specified document filter', HttpStatus.NOT_FOUND)
        }

        if (filter.expired) {
            return false
        }

        if (filter.expiration_date) {
            // Check if it is expired by date
            let expiration = new Date(filter.expiration_date)
            let today = new Date(Date.now())

            // Compare at day level
            today.setHours(1, 0, 0, 0) // one hour further so it will expire on same day comparisons
            expiration.setHours(0, 0, 0, 0)

            if (expiration.getTime() < today.getTime()) {
                // Expire the document
                await this.filter_repo.update({ id: id }, { expired: true })

                return false
            }

        }

        return true
    }
}