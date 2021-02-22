import { Get, Controller, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { FieldsValidationPipe } from "src/common/pipes/FieldsValidation.pipe"
import { TemplateTypeFillPipe } from "src/common/pipes/TemplateTypeFill.pipe"
import { CategoriesFillPipe } from "src/common/pipes/CategoriesFill.pipe"
import { FieldsValueValidationPipe } from "src/common/pipes/FieldsValueValidation.pipe"
import { SplitNamesFromIDsPipe } from "src/common/pipes/SplitNamesFromIDs.pipe"
import { AuthGuard } from "src/common/guards/Auth.guard"
import { DocumentService } from "src/document/document.service"
import { CreateDocumentDto, DocumentDto } from "src/document/dto/document.dto"
import { DocumentStatusGuard } from "src/common/guards/DocumentStatus.guard"
import { DocumentStatus } from "src/document/document.config"
import { AllowedStatus } from "src/common/guards/decorators/AllowedStatus"
import { DocumentVersionFillPipe } from "src/common/pipes/DocumentVersionFill.pipe"
import { User } from "src/user/user.entity"

@ApiBearerAuth()
@ApiTags('Templates')
@Controller('templates')
@UseGuards(AuthGuard)
export class TemplateController {
    constructor(private readonly service: DocumentService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find(@Query('categories', SplitNamesFromIDsPipe) categories: string, @Query('status', SplitNamesFromIDsPipe) status: string) {
        return this.service.findAll(categories, status, true, false)
    }

    @Post()
    add(@Body(FieldsValidationPipe, FieldsValueValidationPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: CreateDocumentDto) {
        return this.service.addDocument(dto, true)
    }

    @Patch(':id')
    @UseGuards(DocumentStatusGuard)
    @AllowedStatus(DocumentStatus.OPEN, DocumentStatus.ONLY_EDITION)
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FieldsValidationPipe, FieldsValueValidationPipe, DocumentVersionFillPipe, TemplateTypeFillPipe, CategoriesFillPipe) dto: DocumentDto, @Body('user') user: User) {
        return this.service.updateDocument(id, dto, user)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteDocument(id)
    }

    @Patch(':id/status')
    @UseGuards(DocumentStatusGuard)
    @AllowedStatus(DocumentStatus.ONLY_CAPTURE, DocumentStatus.ONLY_EDITION, DocumentStatus.OPEN, DocumentStatus.PREVENT_CHANGES)
    setStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: string) {
        return this.service.setStatus(id, status)
    }
}