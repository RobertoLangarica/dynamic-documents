import { HttpException, Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from '../../auth/auth.service'
import { APISecretService } from 'src/api_secret/api_secret.service'


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService, private readonly secret: APISecretService) {
  }

  async use(req: Request, res: Response, next: Function) {
    const routesWithoutAuth = ['/api/login', '/api/signup']
    if (routesWithoutAuth.includes(req.baseUrl)) return next()
    let user = await this.auth.userFromToken(req.header('Authorization'))
    // Could be using an API secret
    if (!user) {
      user = await this.secret.getUserFromSecret(req, req.header('Authorization'))
    }

    if (!user) {
      throw new HttpException({ message: 'auth_needed' }, 403)
    }

    req.body.user = user
    next()
  }
}
