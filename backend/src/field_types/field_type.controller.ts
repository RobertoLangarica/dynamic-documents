import { Controller, Get, Param, Post, Body, Delete, Patch, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { FieldTypeService } from "./field_type.service";
import { FieldTypeDto, CreateFieldTypeDto } from "./field_type.dto";
import { ValidationsFillPipe } from "src/common/pipes/ValidationsFill.pipe";
import { AuthGuard } from "src/common/guards/Auth.guard";

@ApiBearerAuth()
@ApiTags('Types')
@Controller('field_types')
@UseGuards(AuthGuard)
export class FieldTypeController {
    constructor(private readonly service: FieldTypeService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body(ValidationsFillPipe) dto: CreateFieldTypeDto) {
        return this.service.addType(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(ValidationsFillPipe) dto: FieldTypeDto) {
        return this.service.updateType(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteType(id)
    }
}