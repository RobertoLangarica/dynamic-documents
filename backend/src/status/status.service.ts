import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status } from "src/status/status.entity"
import { StatusDto } from "./status.dto";

@Injectable()
export class StatusService {
    constructor(@InjectRepository(Status)
    private readonly status_repo: Repository<Status>
    ) { }

    async findAll(): Promise<Status[]> {
        return await this.status_repo.find()
    }

    async findByName(name: string): Promise<Status> {
        return await this.status_repo.findOne({ name: name })
    }

    async deleteStatus(id: string) {
        await this.status_repo.delete({ id: id })
    }

    async addStatus(data: StatusDto): Promise<Status> {
        let status = await this.status_repo.create(data)

        try {
            status = await this.status_repo.save(status)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return status
    }

    async updateStatus(id: string, data: StatusDto) {
        await this.status_repo.update(id, { name: data.name })
    }

    async getIDsFromNames(names: string[], create_new: boolean = false): Promise<Object[]> {
        let result = []
        let inserted_ids = []
        result = await this.status_repo.createQueryBuilder('c')
            .select("c.id, c.name")
            .where("c.name = ANY(:names)", { names: names })
            .getRawMany()

        if (create_new && result.length < names.length) {
            // Creating the new categories
            let missing: Object[] = []

            names.forEach(name => {
                let index = result.findIndex(r => r.name == name)
                if (index < 0) {
                    missing.push({ name: name })
                }
            })

            if (missing.length > 0) {
                //Insert the new ones
                let insert = await this.status_repo.createQueryBuilder()
                    .insert()
                    .values(missing)
                    .execute()
                inserted_ids = insert.identifiers
            }
        }

        return result.map(value => {
            return { id: value["id"] }
        }).concat(inserted_ids)
    }
}