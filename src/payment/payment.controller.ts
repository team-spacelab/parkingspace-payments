import { Controller, Get, Post, Body, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { AuthGuard } from '../auth/auth.guard'
import { PaymentReq } from './dto/payment.dto'

import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
  constructor (private readonly paymentService: PaymentService) {}

  @Get('/callback')
  @UseGuards(AuthGuard)
  authCallback (@Query('code') code: string, @Res() res: Response) {
    if (!code) return res.status(400).send('Bad Request 400')
    this.paymentService.authCallback(code, res.locals.userId)
    res.status(200).send('OK')
  }

  @Post('/')
  @UseGuards(AuthGuard)
  payCallback (@Body() body: PaymentReq, @Res() res: Response) {
    this.paymentService.payCallback(body, res.locals.userId)
    res.status(200).send('OK')
  }
}
