import { Controller, Get, Header, HttpException, Param, ParseUUIDPipe, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/Auth.guard";
import { FilesService } from "./files.service";

@ApiTags('Files')
@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
    constructor(private readonly service: FilesService) { }

    @Get(':id')
    @Header('Content-Type','application/pdf')
    @Header('Content-Disposition', 'attachment;filename=doc.pdf')
    findOne(@Param('id', ParseUUIDPipe) id:string, ){
        return this.service.getFile(id) 
    }
}