import { Module } from "@nestjs/common";
import { TransformationController } from "./transformation.controller";
import { TransformationService } from "./transformation.service";
import { FieldTypeModule } from "src/field_types/field_type.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transformation } from "./transformation.entity";

@Module({
    controllers: [TransformationController],
    providers: [TransformationService],
    imports: [FieldTypeModule, TypeOrmModule.forFeature([Transformation])],
    exports: [TransformationService]
})
export class TransformationModule { }