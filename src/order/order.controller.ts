import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { OrderService } from './order.service'
import { GenerateOrderBodyDto } from './dto/GenerateOrderBody.dto'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ClientGuard, ResponseBody } from 'parkingspace-commons'

@Controller('order')
export class OrderController {
  constructor (
    private readonly orderSerivce: OrderService
  ) {}

  @Get('/methods')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async getMethods (@Res({ passthrough: true }) res: Response): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.getMethods(res.locals.userId)
    return {
      success: true,
      data
    }
  }

  @Post('/generate')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async generateOrder (
    @Res({ passthrough: true }) res: Response,
    @Body() body: GenerateOrderBodyDto
  ): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.generateOrder(res.locals.userId, body)
    return {
      success: true,
      data
    }
  }
}
