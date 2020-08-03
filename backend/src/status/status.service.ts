import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status } from "src/status/status.entity"
import { StatusDto } from "./status.dto";

@Injectable()
export class StatusService {
    constructor(@InjectRepository(Status)
    private readonly status_repo: Repository<Status>
    ) { }

    async findAll(): Promise<Object> {
        return { items: await this.status_repo.find() }
    }

    async findById(id: string): Promise<Status> {
        let status = await this.status_repo.findOne(id)

        if (!status) {
            throw new NotFoundException()
        }

        return status
    }

    async findByName(name: string): Promise<Status> {
        return await this.status_repo.findOne({ name: name })
    }

    async deleteStatus(id: string) {
        let toDelete = await this.status_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.status_repo.delete({ id: id })
    }

    async addStatus(data: StatusDto): Promise<Status> {
        let status = await this.status_repo.create(data)

        try {
            status = await this.status_repo.save(status)
            return status
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

    }

    async updateStatus(id: string, data: StatusDto) {
        // Prevent duplicated names
        let duplicated = await this.status_repo.createQueryBuilder('s')
            .where("s.name = :name AND s.id != :id ", { name: data.name, id: id })
            .getRawOne()

        if (duplicated) {
            throw new ConflictException(`There is an already existing status with the name: ${data.name}`)
        }

        data['id'] = id;
        let status = await this.status_repo.preload(data)

        if (!status) {
            throw new HttpException('Unable to find the required status', HttpStatus.NOT_FOUND)
        }

        status = await this.status_repo.save(status)
        return status
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