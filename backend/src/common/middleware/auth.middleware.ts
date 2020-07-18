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

    let authorization = req.header('Authorization')
    let splitted: string[] = authorization ? authorization.split(' ') : [];


    if (splitted.length < 2) {
      // Bad format
      throw new HttpException({ message: 'auth_needed' }, 403)
    }

    let user;
    if (splitted[0].toLowerCase() == "apikey") {
      // API secret
      user = await this.secret.getUserFromSecret(req, splitted[1])
    } else {
      // Bearer token
      user = await this.auth.userFromToken(splitted[1])
    }


    if (!user) {
      throw new HttpException({ message: 'auth_needed' }, 403)
    }

    req.body.user = user
    next()
  }
}
