import {IsEmail, IsNotEmpty, MinLength} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class LoginDto {
  @IsNotEmpty() @IsEmail() @ApiProperty()
  readonly email: string
  @IsNotEmpty() @MinLength(5) @ApiProperty()
  readonly password: string
}
