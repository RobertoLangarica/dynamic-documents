import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from "@nestjs/common";
import { ValidationDto } from "./validation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Validation } from "./validation.entity";
import { Repository } from "typeorm";

@Injectable()
export class ValidationService {
    constructor(
        @InjectRepository(Validation)
        private readonly validation_repo: Repository<Validation>,
    ) { }

    async findAll(): Promise<Object> {
        return { items: await this.validation_repo.find() }
    }

    async findById(id: string): Promise<Validation> {
        try {
            let validation = await this.validation_repo.findOneOrFail({ id: id })
            return validation
        } catch (e) {
            throw new NotFoundException()
        }
    }

    async addValidation(data: ValidationDto): Promise<Validation> {
        let validation: Validation = await this.validation_repo.create(data)

        try {
            validation = await this.validation_repo.save(validation)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return validation
    }

    async deleteValidation(id: string) {
        let toDelete = await this.validation_repo.findOne(id)

        if (!toDelete) {
            throw new NotFoundException()
        }

        await this.validation_repo.remove([toDelete])

        return {}
    }

    async updateValidation(id: string, data: ValidationDto): Promise<Validation> {
        if (data.name) {
            // Prevent duplicated names
            let duplicated = await this.validation_repo.createQueryBuilder('v')
                .select("v.id")
                .where("v.name = :name AND id != :id ", { name: data.name, id: id })
                .getRawOne()

            if (duplicated) {
                throw new ConflictException(`There is an already existing validation with the name: ${data.name}`)
            }
        }

        data['id'] = id;
        let validation = await this.validation_repo.preload(data)

        if (!validation) {
            throw new HttpException('Unable to find the required validation', HttpStatus.NOT_FOUND)
        }

        validation = await this.validation_repo.save(validation)
        return validation
    }

    async getIDsFromNames(names: string[]): Promise<Object[]> {
        let result = []
        result = await this.validation_repo.createQueryBuilder('v')
            .select("v.id")
            .where("v.name = ANY(:names)", { names: names })
            .getRawMany()

        return result.map(value => {
            return { id: value["v_id"] }
        })
    }
}