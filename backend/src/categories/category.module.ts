import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./category.entity";
import { CategoryService } from "./category.service";

@Module({
    controllers: [CategoryController],
    providers: [CategoryService],
    imports: [TypeOrmModule.forFeature([Category])],
    exports: [CategoryService]
})
export class CategoryModule { }