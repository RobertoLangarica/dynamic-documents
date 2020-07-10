import { TemplateService } from "./template.service"
import { Get, Controller, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { TemplateDto } from "./dto/template.dto"
import { FieldsValidationPipe } from "src/common/pipelines/FieldsValidation.pipe"
import { TemplateTypeFillPipe } from "src/common/pipelines/TemplateTypeFill.pipe"
import { CategoriesFillPipe } from "src/common/pipelines/CategoriesFill.pipe"

@ApiBearerAuth()
@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly service: TemplateService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find(@Query('categories') categories: string) {
        return this.service.findAll(categories)
    }

    @Post()
    add(@Body(FieldsValidationPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: TemplateDto) {
        return this.service.addTemplate(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FieldsValidationPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: TemplateDto) {
        return this.service.updateTemplate(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteTemplate(id)
    }
}