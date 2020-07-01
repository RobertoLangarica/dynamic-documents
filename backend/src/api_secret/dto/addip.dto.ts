import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AddIPDTO {
    @IsOptional() @ApiPropertyOptional()
    readonly ip: string
}