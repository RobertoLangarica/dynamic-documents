import { IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SecretDTO {
    @IsOptional() @ApiPropertyOptional()
    readonly secret:string;

    @IsOptional() @ApiPropertyOptional()
    readonly ip:string
}