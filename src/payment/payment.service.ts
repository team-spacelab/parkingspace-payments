import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentReq } from './dto/payment.dto'

@Injectable()
export class PaymentService {
  constructor (
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  private headers = {
    Authorization: `Basic ${Buffer.from(this.configService.get('TOSS_SECRET', '') + ':', 'utf8').toString('base64')}`,
    'Content-Type': 'application/json'
  }

  authCallback (code: string, userId: number) {
    this.httpService.post(
      'https://api.tosspayments.com/v1/brandpay/authorizations/access-token',
      JSON.stringify({ grantType: 'AuthorizationToken', customerKey: userId, code }),
      { headers: this.headers }
    )

    return { success: true }
  }

  payCallback (body: PaymentReq, userId: number) {
    this.httpService.post(
      'https://api.tosspayments.com/v1/brandpay/payments/confirm',
      JSON.stringify({ ...body, customerKey: userId }),
      { headers: this.headers }
    )
  }
}
