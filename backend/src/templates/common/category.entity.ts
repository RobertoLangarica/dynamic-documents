import { Entity } from "typeorm";
import { SimpleEntity } from "src/common/entities/simple_entity.entity";

@Entity('categories')
export class Category extends SimpleEntity { }