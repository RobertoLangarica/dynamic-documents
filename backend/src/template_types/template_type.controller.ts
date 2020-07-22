import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TemplateTypeService } from "./template_type.service";
import { TemplateTypeDto } from "./template_type.dto";
import { AuthGuard } from "src/common/guards/Auth.guard";


@ApiBearerAuth()
@ApiTags('Template Types')
@Controller('template_types')
@UseGuards(AuthGuard)
export class TemplateTypeController {
    constructor(private readonly service: TemplateTypeService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
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
    modify(@Param('id', ParseUUIDPipe) id: string, @Body() dto: TemplateTypeDto) {
        return this.service.updateTemplateType(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteTemplateType(id)
    }
}