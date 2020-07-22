import { TemplateService } from "./template.service"
import { Get, Controller, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { TemplateDto } from "./dto/template.dto"
import { FieldsValidationPipe } from "src/common/pipes/FieldsValidation.pipe"
import { TemplateTypeFillPipe } from "src/common/pipes/TemplateTypeFill.pipe"
import { CategoriesFillPipe } from "src/common/pipes/CategoriesFill.pipe"
import { FieldsValueValidationPipe } from "src/common/pipes/FieldsValueValidation.pipe"
import { SplitNamesFromIDsPipe } from "src/common/pipes/SplitNamesFromIDs.pipe"
import { AuthGuard } from "src/common/guards/Auth.guard"

@ApiBearerAuth()
@ApiTags('Templates')
@Controller('templates')
@UseGuards(AuthGuard)
export class TemplateController {
    constructor(private readonly service: TemplateService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find(@Query('categories', SplitNamesFromIDsPipe) categories: string) {
        return this.service.findAll(categories)
    }

    @Post()
    add(@Body(FieldsValidationPipe, FieldsValueValidationPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: TemplateDto) {
        return this.service.addTemplate(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FieldsValidationPipe, FieldsValueValidationPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: TemplateDto) {
        return this.service.updateTemplate(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteTemplate(id)
    }
}