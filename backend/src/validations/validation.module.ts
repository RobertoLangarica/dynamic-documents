import { Module } from "@nestjs/common";
import { ValidationController } from "./validation.controller";
import { ValidationService } from "./validation.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Validation } from "./validation.entity";

@Module({
    controllers: [ValidationController],
    providers: [ValidationService],
    imports: [TypeOrmModule.forFeature([Validation])],
    exports: [ValidationService]
})
export class ValidationModule { }