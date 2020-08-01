import { Controller, Get, Param, Post, Body, Patch, Delete, ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CategoryDto } from "./category.dto";
import { AuthGuard } from "src/common/guards/Auth.guard";

@ApiBearerAuth()
@ApiTags('Categories')
@Controller('categories')
@UseGuards(AuthGuard)
export class CategoryController {
    constructor(private readonly service: CategoryService) { }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.findById(id)
    }

    @Get()
    find() {
        return this.service.findAll()
    }

    @Post()
    add(@Body() dto: CategoryDto) {
        return this.service.addCategory(dto)
    }

    @Patch(':id')
    modify(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CategoryDto) {
        return this.service.updateCategory(id, dto)
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.deleteCategory(id)
    }
}