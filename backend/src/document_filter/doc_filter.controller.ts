import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Patch, Delete, Query, UseGuards } from "@nestjs/common";
import { DocumentFilterService } from "./doc_filter.service";
import { DocFilterDto, CreateDocFilterDto } from "./doc_filter.dto";
import { CaptureDto } from "./capture.dto";
import { ParseUUIDOrNullPipe } from "src/common/pipes/ParseUUIDOrNull.pipe";
import { FilterValidationPipe } from "src/common/pipes/FilterValidation.pipe";
import { User } from "src/user/user.entity";
import { ParseBooleanPipe } from "src/common/pipes/ParseBoolean.pipe";
import { DocumentFilterExpiredGuard } from "src/common/guards/DocumentFilterExpired.guard";
import { DocumentFilterCanCaptureGuard } from "src/common/guards/DocumentFilterCanCapture.guard";
import { AuthGuard } from "src/common/guards/Auth.guard";

@Controller('filters')
export class DocumentFilterController {
    constructor(private readonly service: DocumentFilterService) { }

    @Get(':id')
    @UseGuards(AuthGuard)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    @UseGuards(AuthGuard)
    find(@Query('document', ParseUUIDOrNullPipe) document, @Query('expired', ParseBooleanPipe) expired: boolean) {
        return this.service.findAll(document, expired)
    }

    @Post()
    @UseGuards(AuthGuard)
    add(@Body(FilterValidationPipe) dto: CreateDocFilterDto, @Body('user') user: User) {
        return this.service.addFilter(dto, user)
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FilterValidationPipe) dto: DocFilterDto) {
        return this.service.updateFilter(id, dto)
    }

    @Patch(':id/expire')
    @UseGuards(AuthGuard)
    expire(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.expire(id)
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteFilter(id)
    }

    @Get(':id/filtered')
    @UseGuards(DocumentFilterExpiredGuard)
    getFilteredDoc(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.getFilteredDocument(id)
    }

    @Patch(':id/filtered')
    @UseGuards(DocumentFilterExpiredGuard, DocumentFilterCanCaptureGuard)
    setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() capture: CaptureDto) {
        return this.service.saveFilteredDocument(id, capture)
    }
}