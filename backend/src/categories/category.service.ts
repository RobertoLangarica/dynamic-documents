import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
import { isUUID, UUIDVersion } from "class-validator";
import { CategoryDto } from "./category.dto";

@Injectable()
export class CategoryService {
    constructor(@InjectRepository(Category)
    private readonly category_repo: Repository<Category>
    ) { }

    async findAll(): Promise<Category[]> {
        return await this.category_repo.find()
    }

    async deleteCategory(id: string) {
        this.validateUUID(id)
        await this.category_repo.delete({ id: id })
    }

    async addCategory(data: CategoryDto): Promise<Category> {
        let category = await this.category_repo.create(data)

        try {
            category = await this.category_repo.save(category)
        } catch (e) {
            if (e.code && e.code == 23505) {
                throw new HttpException(e.detail, HttpStatus.CONFLICT)
            } else {
                // uknown error
                throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }

        return category
    }

    async updateCategory(id: string, data: CategoryDto) {
        this.validateUUID(id)
        await this.category_repo.update(id, { name: data.name })
    }

    validateUUID(value: string, version?: UUIDVersion) {
        if (!isUUID(value, version)) {
            throw new HttpException('The id received is not an UUID', HttpStatus.BAD_REQUEST)
        }
    }
}