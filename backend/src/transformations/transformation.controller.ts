import { Controller, Get, Param, Post, Body, Delete, Patch } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransformationService } from "./transformation.service";
import { TransformationDto } from "./transformation.dto";

@ApiBearerAuth()
@ApiTags('Transformations')
@Controller('transformations')
export class TransformationController {
    constructor(private readonly service: TransformationService) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: TransformationDto) {
        return this.service.addTransformation(dto)
    }

    @Patch(':id')
    modify(@Param('id') id: string, @Body() dto: TransformationDto) {
        return this.service.updateTransformation(id, dto)
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.deleteTransformation(id)
    }
}