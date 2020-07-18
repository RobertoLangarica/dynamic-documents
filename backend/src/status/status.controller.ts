import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { StatusService } from "./status.service";
import { StatusDto } from "./status.dto";

@ApiBearerAuth()
@ApiTags('document status')
@Controller('status')
export class StatusController {
    constructor(private readonly service: StatusService) { }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: StatusDto) {
        return this.service.addStatus(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body() dto: StatusDto) {
        return this.service.updateStatus(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteStatus(id)
    }
}