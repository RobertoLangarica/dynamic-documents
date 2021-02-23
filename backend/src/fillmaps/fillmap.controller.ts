import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { FillmapService } from "./fillmap.service";
import { FillmapDto, FillmapCreationDto } from "./fillmap.dto";
import { AuthGuard } from "src/common/guards/Auth.guard";
import { ExistsPipe } from "src/common/pipes/Exists.pipe";
import { ExistsTemplateTypePipe } from "src/common/pipes/ExistsTemplateType.pipe";
import { ParseUUIDOrNullPipe } from "src/common/pipes/ParseUUIDOrNull.pipe";
import { NoDuplicatedFillmapPipe } from "src/common/pipes/NoDuplicatedFillmap.pipe";
import { FillmapFieldsValidationPipe } from "src/common/pipes/FillmapFieldsValidation.pipe";
import { ExistsFillmapPipe } from "src/common/pipes/ExistsFillmap.pipe copy";

@ApiBearerAuth()
@ApiTags('Fillmaps')
@Controller('fillmaps')
@UseGuards(AuthGuard)
export class FillmapController {
    constructor(private readonly service: FillmapService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe, ExistsFillmapPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Get('by')
    findBy(@Query('source') source: string, @Query('destination', ParseUUIDOrNullPipe) destination: string) {
        if(!source && !destination){
            return this.service.findAll()
        }

        return this.service.findBy(source, destination)
    }

    @Post()
    add(@Body(NoDuplicatedFillmapPipe, FillmapFieldsValidationPipe) dto: FillmapCreationDto, @Body('destination_type_id', ExistsTemplateTypePipe) dest_validation:string) {
        return this.service.addFillmap(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe, ExistsFillmapPipe) id: string, @Body(FillmapFieldsValidationPipe) dto: FillmapDto) {
        return this.service.updateFillmap(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe, ExistsFillmapPipe) id: string) {
        return this.service.deleteFillmap(id)
    }
}