import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { OrderService } from './order.service'
import { GenerateOrderBodyDto } from './dto/GenerateOrderBody.dto'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ClientGuard, OrderStatus, ResponseBody } from 'parkingspace-commons'
import { ConfirmOrderBodyDto } from './dto/ConfirmOrderBody.dto'

@Controller('order')
export class OrderController {
  constructor (
    private readonly orderSerivce: OrderService
  ) {}

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async getOrders (
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.findByUserId(res.locals.userId)
    return {
      success: true,
      data
    }
  }

  @Post('/')
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

  @Get('/payments')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async getMethods (@Res({ passthrough: true }) res: Response): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.getPayments(res.locals.userId)
    return {
      success: true,
      data
    }
  }

  @Post('/confirm')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async confirmOrder (
    @Res({ passthrough: true }) res: Response,
    @Body() body: ConfirmOrderBodyDto
  ): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.confirmOrder(res.locals.userId, body)
    return {
      success: true,
      data
    }
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async getOrder (
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string
  ): Promise<ResponseBody<any>> {
    const data = await this.orderSerivce.findOne(id, res.locals.userId)
    return {
      success: true,
      data
    }
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async cancelOrder (
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: string
  ): Promise<ResponseBody<any>> {
    await this.orderSerivce.cancelOrder(id, res.locals.userId, OrderStatus.CANCELED)
    return {
      success: true
    }
  }
}
