import { Controller, Get, Param, Post, Body, Delete, Patch, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransformationService } from "./transformation.service";
import { TransformationDto } from "./transformation.dto";
import { FieldTypeFillPipe } from "src/common/pipes/FieldTypeFill.pipe";
import { AuthGuard } from "src/common/guards/Auth.guard";

@ApiBearerAuth()
@ApiTags('Transformations')
@Controller('transformations')
@UseGuards(AuthGuard)
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