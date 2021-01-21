import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdvancedConsoleLogger, Repository } from "typeorm";
import { Document } from "src/document/document.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID } from "class-validator";

@Injectable()
export class DocumentStatusGuard implements CanActivate {
    constructor(private reflector: Reflector,
        @InjectRepository(Document)
        private readonly doc_repo: Repository<Document>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const status = this.reflector.get<string[]>('allowed_status', context.getHandler());
        let doc_param = this.reflector.get<string>('doc_id', context.getHandler());
        if (!status) {
            return true;
        }
        const request = context.switchToHttp().getRequest()
        const doc_id = doc_param ? request.params[doc_param] : request.params['id']

        if (!isUUID(doc_id)) {
            return false
        }

        let doc = await this.doc_repo.createQueryBuilder('d')
            .select('d.id')
            .leftJoinAndSelect('d.status', 's')
            .where("d.id = :id", { id: doc_id })
            .getOne()

        if (!doc) {
            return false
        }
        let can = status.findIndex(item => item === doc.status.name) >= 0
        if(!can){
            console.log('Acción INVALIDA en el documento que tiene el estado: ',doc.status.name)
        }
        return can
    }
}