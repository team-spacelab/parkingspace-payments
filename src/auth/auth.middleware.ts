import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor (private readonly authService: AuthService) {}

  use (req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization
    if (!token) return next()

    const userId = this.authService.verifyToken(token).sub
    if (!userId) return next()

    res.locals.userId = userId
    next()
  }
}
