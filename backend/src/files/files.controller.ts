import { Controller, Get, Header, Headers, HttpException, Param, ParseUUIDPipe, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthGuard } from "src/common/guards/Auth.guard";
import { FilesService } from "./files.service";

@ApiTags('Files')
@Controller('files')
@UseGuards(AuthGuard)
export class FilesController {
    constructor(private readonly service: FilesService) { }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id:string, @Headers('authorization') auth:string, @Res() res:Response){
        let {stream, name} =  await this.service.getFile(id, auth) 

        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition',`attachment; filename="${name}"`)
        // @ts-ignore
        stream.pipe(res)
    }
}