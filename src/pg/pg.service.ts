import { request } from 'undici'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpMethod } from 'undici/types/dispatcher'

@Injectable()
export class PgService {
  constructor (
    private readonly configService: ConfigService
  ) {}

  async getToken (code: string, customerKey: string) {
    const { body } =
      await this.request('/v1/brandpay/authorizations/access-token', 'POST', {
        code,
        grantType: 'AuthorizationCode',
        customerKey
      })

    return body
  }

  async getPayments (userId: number) {
    const { statusCode, body } =
      await this.request('/v1/brandpay/payments/methods/user-' + userId, 'GET')

    if (statusCode !== 200) return { cards: [], accounts: [] }
    return body
  }

  async confirmOrder (amount: number, paymentKey: string, orderId: string, userId: number) {
    const { statusCode, body } =
      await this.request('/v1/brandpay/payments/confirm', 'POST', {
        paymentKey,
        amount,
        orderId,
        customerKey: 'user-' + userId
      }) as any

    if (statusCode !== 200) {
      await this.cancelOrder(paymentKey, body.message)
      return {
        status: false,
        ...body
      }
    }

    return { status: true, body }
  }

  async cancelOrder (paymentKey: string, cancelReason: string) {
    const { statusCode, body } =
      await this.request('/v1/payments/' + paymentKey + '/cancel', 'POST', {
        cancelReason
      }) as any

    if (statusCode !== 200) {
      return {
        status: false,
        ...body
      }
    }

    return { status: true, body }
  }

  private async request (path: string, method: HttpMethod, reqBody?: any) {
    const secret = Buffer.from(this.configService.get('TOSS_SECRET', '') + ':').toString('base64')
    const { statusCode, body } =
      await request('https://api.tosspayments.com' + path, {
        method,
        body: JSON.stringify(reqBody),
        headers: {
          Authorization: `Basic ${secret}`,
          'Content-Type': 'application/json'
        }
      })

    return { statusCode, body: await body.json() }
  }
}
