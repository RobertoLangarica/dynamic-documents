import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { Controller, Get, Param, ParseUUIDPipe, Query, Post, Body, Patch, Delete, UseGuards, SetMetadata } from "@nestjs/common"
import { DocumentService } from "./document.service"
import { FieldsValidationPipe } from "src/common/pipes/FieldsValidation.pipe"
import { FieldsValueValidationPipe } from "src/common/pipes/FieldsValueValidation.pipe"
import { CategoriesFillPipe } from "src/common/pipes/CategoriesFill.pipe"
import { DocumentDto, CreateDocumentDto } from "./dto/document.dto"
import { DocumentVersionFillPipe } from "src/common/pipes/DocumentVersionFill.pipe"
import { User } from "src/user/user.entity"
import { DocumentStatusGuard } from "src/common/guards/DocumentStatus.guard"
import { AllowedStatus } from "src/common/guards/decorators/AllowedStatus"
import { SplitNamesFromIDsPipe } from "src/common/pipes/SplitNamesFromIDs.pipe"
import { DocumentStatus } from "./document.config"
import { AuthGuard } from "src/common/guards/Auth.guard"
import { ParseBooleanPipe } from "src/common/pipes/ParseBoolean.pipe"

@ApiBearerAuth()
@ApiTags('Documents')
@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentController {
    constructor(private readonly service: DocumentService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string,) {
        return this.service.findById(id)
    }

    @Get()
    find(@Query('categories', SplitNamesFromIDsPipe) categories: string, @Query('status', SplitNamesFromIDsPipe) status: string) {
        return this.service.findAll(categories, status, false, true)
    }

    @Post()
    add(@Body(FieldsValidationPipe, FieldsValueValidationPipe, CategoriesFillPipe) dto: CreateDocumentDto) {
        return this.service.addDocument(dto)
    }

    @Post('from-template')
    addFromTemplate(@Body(FieldsValidationPipe, FieldsValueValidationPipe, CategoriesFillPipe) dto: CreateDocumentDto) {
        return this.service.addDocumentFromTemplate(dto)
    }

    @Get(':id/field/:field_id')
    @UseGuards(DocumentStatusGuard)
    @AllowedStatus(DocumentStatus.OPEN, DocumentStatus.ONLY_EDITION)
    cloneField(@Param('id', ParseUUIDPipe) id: string, @Param('field_id', ParseUUIDPipe) field_id: string, @Query('keep_maps', ParseBooleanPipe) keep_maps:boolean) {
        return this.service.cloneField(id, field_id, keep_maps)
    }

    @Patch(':id')
    @UseGuards(DocumentStatusGuard)
    @AllowedStatus(DocumentStatus.OPEN, DocumentStatus.ONLY_EDITION)
    modify(@Param('id', ParseUUIDPipe) id: string, @Body(FieldsValidationPipe, FieldsValueValidationPipe, DocumentVersionFillPipe, CategoriesFillPipe) dto: DocumentDto, @Body('user') user: User) {
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