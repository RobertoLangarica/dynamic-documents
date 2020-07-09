import { Controller, Get, Param, Post, Body, Delete, Patch, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { FieldTypeService } from "./field_type.service";
import { FieldTypeDto } from "./field_type.dto";

@ApiBearerAuth()
@ApiTags('Types')
@Controller('types')
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
    add(@Body() dto: FieldTypeDto) {
        return this.service.addType(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FieldTypeDto) {
        return this.service.updateType(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteType(id)
    }
}