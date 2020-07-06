import { SimpleDto } from "src/common/dto/simple_entity.dto";
import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ValidationDto extends SimpleDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    regex: string

    @IsNotEmpty() @IsString() @ApiProperty()
    error_message: string
}