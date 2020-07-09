import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { Repository } from "typeorm";
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
        await this.category_repo.update(id, { name: data.name })
    }

    async getIDsFromNames(names: string[], create_new: boolean = false): Promise<Object[]> {
        let result = []
        let inserted_ids = []
        result = await this.category_repo.createQueryBuilder('c')
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
                let insert = await this.category_repo.createQueryBuilder()
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