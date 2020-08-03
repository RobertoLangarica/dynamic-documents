import { DDTemplateBaseEntity } from "./common/DDTemplateBaseEntity";
import { DDCategory } from "./DDCategory";
import { Type } from "class-transformer";

export class DDTemplate extends DDTemplateBaseEntity {
    @Type(() => DDCategory)
    categories: DDCategory[] = []
}
