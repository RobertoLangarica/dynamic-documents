import { Controller, Get, Param, Post, Body, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TemplateTypeService } from "./template_type.service";
import { TemplateTypeDto } from "./template_type.dto";


@ApiBearerAuth()
@ApiTags('Template Types')
@Controller('template_types')
export class TemplateTypeController {
    constructor(private readonly service: TemplateTypeService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: TemplateTypeDto) {
        return this.service.addTemplateType(dto)
    }

    @Patch(':id')
    modify(@Param('id') id: string, @Body() dto: TemplateTypeDto) {
        return this.service.updateTemplateType(id, dto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.deleteTemplateType(id)
    }
}