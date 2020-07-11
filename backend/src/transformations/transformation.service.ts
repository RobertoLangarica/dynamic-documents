import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
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

    async findAll(): Promise<Transformation[]> {
        // Using query builder instead of find to avoid the eager relation between FieldType and Validations
        return await this.transformation_repo.createQueryBuilder('ts')
            .leftJoinAndSelect("ts.supported_types", "types")
            .getMany()

    }

    async findById(id: string): Promise<Transformation> {
        // Using query builder instead of find to avoid the eager relation between FieldType and Validations
        // return await this.transformation_repo.findOne({ id: id })
        return await this.transformation_repo.createQueryBuilder("ts")
            .where("ts.id = :id", { id: id })
            .leftJoinAndSelect('ts.supported_types', 'types')
            .getOne()

    }

    async deleteTransformation(id: string) {
        await this.transformation_repo.delete({ id: id })
    }

    async addTransformation(data: TransformationDto): Promise<Transformation> {
        let transformation = await this.transformation_repo.create(data)

        try {
            transformation = await this.transformation_repo.save(transformation)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return transformation
    }

    async updateTransformation(id: string, data: TransformationDto): Promise<Transformation> {
        // the repository.preload make a merge between arrays.
        // We avoid that by sending an empty array and replacing it for the new one after preload
        let types = data.supported_types;
        data.supported_types = []
        data['id'] = id;
        let transformation = await this.transformation_repo.preload(data)

        if (!transformation) {
            throw new HttpException('Unable to find the required transformation', HttpStatus.NOT_FOUND)
        }

        transformation.supported_types = types;

        transformation = await this.transformation_repo.save(transformation)
        return transformation
    }
}