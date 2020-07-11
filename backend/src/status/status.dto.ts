import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StatusDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string
}