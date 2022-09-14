import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString } from 'class-validator'

export class ConfirmOrderBodyDto {
  @IsString()
  @ApiProperty()
    orderId: string

  @IsString()
  @ApiProperty()
    paymentKey: string

  @IsNumber()
  @ApiProperty()
    amount: number
}
