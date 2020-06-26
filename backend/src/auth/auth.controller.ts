import { Body, Controller, Delete, Get, Post, Req, SetMetadata } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { User } from '../user/user.entity'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly service: AuthService) {
  }

  @Get('me')
  me(@Body('user') user: User | any) {
    return this.service.me(user)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto)
  }

  @Post('signup')
  signup(@Body() dto: LoginDto) {
    return this.service.signUp(dto)
  }

  @Delete('logout')
  logout(@Req() req: Request) {
    return this.service.logout(req.header('Authorization'))
  }
}
