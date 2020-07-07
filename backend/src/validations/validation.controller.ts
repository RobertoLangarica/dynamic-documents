import { ValidationService } from "./validation.service";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { Controller, Get, Post, Body, Delete, Param, Patch } from "@nestjs/common";
import { ValidationDto } from "./validation.dto";

@ApiBearerAuth()
@ApiTags('Validations')
@Controller('validations')
export class ValidationController {
    constructor(private readonly service: ValidationService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: ValidationDto) {
        return this.service.addValidation(dto)
    }

    @Patch(':id')
    modify(@Param('id') id: string, @Body() dto: ValidationDto) {
        return this.service.updateValidation(id, dto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.deleteValidation(id)
    }
}