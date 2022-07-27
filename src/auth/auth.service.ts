import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor (
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  public verifyToken (token: string) {
    try {
      const data = this.jwtService.verify(token.split(' ')[1])
      return data
    } catch {
      return undefined
    }
  }
}
