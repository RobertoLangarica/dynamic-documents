import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Transformation } from "./transformation.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { isUUID, UUIDVersion } from "class-validator";
import { FieldTypeService } from "src/field_types/field_type.service";
import { TransformationDto } from "./transformation.dto";

@Injectable()
export class TransformationService {
    constructor(
        @InjectRepository(Transformation)
        private readonly transformation_repo: Repository<Transformation>,
        private readonly type_service: FieldTypeService
    ) { }

    async findAll(): Promise<Transformation[]> {
        // Using query builder instead of find to avoid the eager relation between FieldType and Validations
        return await this.transformation_repo.createQueryBuilder('ts')
            .leftJoinAndSelect("ts.supported_types", "types")
            .getMany()

    }

    async findById(id: string): Promise<Transformation> {
        this.validateUUID(id)
        // Using query builder instead of find to avoid the eager relation between FieldType and Validations
        // return await this.transformation_repo.findOne({ id: id })
        return await this.transformation_repo.createQueryBuilder("ts")
            .where("ts.id = :id", { id: id })
            .leftJoinAndSelect('ts.supported_types', 'types')
            .getOne()

    }

    async deleteTransformation(id: string) {
        this.validateUUID(id)

        await this.transformation_repo.delete({ id: id })
    }

    async addTransformation(data: TransformationDto): Promise<Transformation> {
        data.supported_types = await this.getTypeIDs(data) as any[]
        console.log(data.supported_types)
        console.log(data)
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
        this.validateUUID(id)

        data['id'] = id;
        let types = await this.getTypeIDs(data)
        // the repository.preload make a merge between arrays.
        // We avoid that by sending an empty array and replacing it for the new one after preload
        data.supported_types = []
        let transformation = await this.transformation_repo.preload(data)

        if (!transformation) {
            throw new HttpException('Unable to find the required transformation', HttpStatus.NOT_FOUND)
        }

        transformation.supported_types = types as any[]

        transformation = await this.transformation_repo.save(transformation)
        return transformation
    }

    async getTypeIDs(data: TransformationDto): Promise<Object[]> {
        if (data.supported_types.length > 0) {
            // Name or IDs are supported
            let names = []
            let ids = []

            data.supported_types.forEach(item => {
                if (!isUUID(item)) {
                    // name
                    names.push(item)
                } else {
                    ids.push(item)
                }
            })

            // this format allow us touse the repository.create function 
            ids.map(item => {
                return { id: item }
            })

            if (names.length > 0) {
                ids = ids.concat(await this.type_service.getIDsFromNames(names))
            }

            return ids
        }
        return []
    }

    validateUUID(value: string, version?: UUIDVersion) {
        if (!isUUID(value, version)) {
            throw new HttpException('The id received is not an UUID', HttpStatus.BAD_REQUEST)
        }
    }


}