import { Injectable, HttpStatus, HttpException, NotFoundException, ConflictException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Transformation } from "./transformation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { TransformationDto } from "./transformation.dto";

@Injectable()
export class TransformationService {
    constructor(
        @InjectRepository(Transformation)
        private readonly transformation_repo: Repository<Transformation>
    ) { }

    async findAll(): Promise<Object> {
        return { items: await this.transformation_repo.find() }
    }

    async findById(id: string): Promise<Transformation> {
        let transform = await this.transformation_repo.findOne(id)

        if (!transform) {
            throw new NotFoundException()
        }

        return transform
    }

    async deleteTransformation(id: string) {
        let toDelete = await this.transformation_repo.createQueryBuilder("ts")
            .select("ts.id")
            .where("ts.id = :id", { id: id })
            .getRawOne()

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.transformation_repo.delete({ id: id })

        return {}
    }

    async addTransformation(data: TransformationDto): Promise<Transformation> {
        let transformation = await this.transformation_repo.create(data)

        try {
            transformation = await this.transformation_repo.save(transformation)

            // Making a find so we are returning the full object (including relations)
            return await this.transformation_repo.findOne(transformation.id)

        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    async updateTransformation(id: string, data: TransformationDto): Promise<Transformation> {
        if (data.name) {
            // Prevent duplicated names
            let duplicated = await this.transformation_repo.createQueryBuilder('t')
                .select("t.id")
                .where("t.name = :name AND t.id != :id ", { name: data.name, id: id })
                .getRawOne()

            if (duplicated) {
                throw new ConflictException(`There is an already existing transformation with the name: ${data.name}`)
            }
        }

        data['id'] = id;
        let transformation = await this.transformation_repo.preload(data)

        if (!transformation) {
            throw new HttpException('Unable to find the required transformation', HttpStatus.NOT_FOUND)
        }

        transformation = await this.transformation_repo.save(transformation)

        // Making a find so we are returning the full object (including relations)
        return await this.transformation_repo.findOne(id)
    }
}