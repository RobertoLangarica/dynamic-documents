import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from '../../auth/auth.service'
import { APISecretService } from 'src/api_secret/api_secret.service'


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly auth: AuthService, private readonly secret: APISecretService) {
  }

  async use(req: Request, res: Response, next: Function) {
    // Reads the Authorization header looking dor a Bearer or APIKey token
    // Is there is a token then a user is retrieved in the body.user property

    let authorization = req.header('Authorization')
    let splitted: string[] = authorization ? authorization.split(' ') : [];

    if (splitted.length < 2) {
      // Bad format, next without user
      next()
      return;
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
      // Next without user
      next()
      return;
    }

    // Next with user
    req.body.user = user
    next()
    return;
  }
}
