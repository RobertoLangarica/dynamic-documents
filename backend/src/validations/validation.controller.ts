import { ValidationService } from "./validation.service";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Post, Body, Delete, Param, Patch, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ValidationDto, CreateValidationDTO } from "./validation.dto";
import { AuthGuard } from "src/common/guards/Auth.guard";

@ApiBearerAuth()
@ApiTags('Validations')
@Controller('validations')
@UseGuards(AuthGuard)
export class ValidationController {
    constructor(private readonly service: ValidationService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: CreateValidationDTO) {
        return this.service.addValidation(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ValidationDto) {
        return this.service.updateValidation(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteValidation(id)
    }
}