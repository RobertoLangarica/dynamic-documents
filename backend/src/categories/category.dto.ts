import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CategoryDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    name: string
}