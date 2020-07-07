import { Module } from "@nestjs/common";
import { FieldTypeController } from "./field_type.controller";
import { FieldTypeService } from "./field_type.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FieldType } from "./field_type.entity";
import { ValidationModule } from "src/validations/validation.module";

@Module({
    controllers: [FieldTypeController],
    providers: [FieldTypeService],
    imports: [TypeOrmModule.forFeature([FieldType]), ValidationModule],
    exports: [FieldTypeService]
})
export class FieldTypeModule { }