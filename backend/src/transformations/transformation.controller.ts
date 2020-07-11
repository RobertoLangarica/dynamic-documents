import { Controller, Get, Param, Post, Body, Delete, Patch, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransformationService } from "./transformation.service";
import { TransformationDto } from "./transformation.dto";
import { FieldTypeFillPipe } from "src/common/pipelines/FieldTypeFill.pipe";

@ApiBearerAuth()
@ApiTags('Transformations')
@Controller('transformations')
export class TransformationController {
    constructor(private readonly service: TransformationService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body(FieldTypeFillPipe) dto: TransformationDto) {
        return this.service.addTransformation(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FieldTypeFillPipe) dto: TransformationDto) {
        return this.service.updateTransformation(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteTransformation(id)
    }
}