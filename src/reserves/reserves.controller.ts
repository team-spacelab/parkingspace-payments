import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ClientGuard, ResponseBody } from 'parkingspace-commons'
import { ReservesService } from './reserves.service'
import { Response } from 'express'

@Controller('reserves')
export class ReservesController {
  constructor (
    private readonly reservesService: ReservesService
  ) {}

  @Get('/zone/:id')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async findByZone (
    @Param('id') id: number
  ): Promise<ResponseBody<any>> {
    const data = await this.reservesService.findByZone(id)
    return {
      success: true,
      data
    }
  }

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async findByUser (
    @Res({ passthrough: true }) res: Response
  ): Promise<ResponseBody<any>> {
    const data = await this.reservesService.findByUser(res.locals.userId)
    return {
      success: true,
      data
    }
  }

  @Get('/:id')
  @ApiBearerAuth()
  @UseGuards(ClientGuard)
  public async findOne (
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<ResponseBody<any>> {
    const data = await this.reservesService.findOne(id, res.locals.userId)
    return {
      success: true,
      data
    }
  }
}
