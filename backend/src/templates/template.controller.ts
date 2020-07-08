import { TemplateService } from "./template.service"
import { Get, Controller, Post, Body, Patch, Param, Delete } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { TemplateDto } from "./dto/template.dto"

@ApiBearerAuth()
@ApiTags('Templates')
@Controller('templates')
export class TemplateController {
    constructor(private readonly service: TemplateService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: TemplateDto) {
        return this.service.addTemplate(dto)
    }

    @Patch(':id')
    modify(@Param('id') id: string, @Body() dto: TemplateDto) {
        return this.service.updateTemplate(id, dto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.deleteTemplate(id)
    }
}