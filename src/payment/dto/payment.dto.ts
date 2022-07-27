import { IsString, IsNumber } from 'class-validator'

export class PaymentReq {
  @IsString()
    paymentKey: string

  @IsNumber()
    amout: number

  @IsString()
    orderId: string
}
