import { ForbiddenException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { CarsService } from 'src/cars/cars.service'
import { ReservesService } from 'src/reserves/reserves.service'
import { UsersService } from 'src/users/users.service'
import { ZonesService } from 'src/zones/zones.service'
import { Repository } from 'typeorm'
import { request } from 'undici'
import { ConfirmOrderBodyDto } from './dto/ConfirmOrderBody.dto'
import { GenerateOrderBodyDto } from './dto/GenerateOrderBody.dto'
import { Orders } from './order.entity'

@Injectable()
export class OrderService {
  constructor (
    private readonly configSerivce: ConfigService,
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly reservesService: ReservesService,
    private readonly zonesService: ZonesService,
    private readonly usersService: UsersService,
    private readonly carsService: CarsService
  ) {}

  async getMethods (userId: number) {
    const { body } = await request('https://api.tosspayments.com/v1/brandpay/payments/methods/' + userId, {
      method: 'GET',
      headers: {
        authorization: `Basic ${Buffer.from(this.configSerivce.get('TOSS_SECRET', '') + ':').toString('base64')}`
      }
    })

    const { isIdentified, selectedMethodId, cards, accounts } = await body.json()
    return {
      default: selectedMethodId,
      methods: isIdentified ? [].concat(cards, accounts) : []
    }
  }

  async generateOrder (userId: number, body: GenerateOrderBodyDto) {
    const { zone, point, car, method, startat, endat } = body
    const user = await this.usersService.findOne(userId)
    if (!user) throw new UnauthorizedException()
    if (user.usersPoint < point) throw new NotAcceptableException('USER_POINT_TOO_LOW')

    const zoneInfo = await this.zonesService.findOne(zone)
    if (!zoneInfo) throw new NotFoundException()
    if (zoneInfo.spaces.spacesStatus !== 1) throw new NotAcceptableException('SPACE_UNAVAILABLE')
    if (!zoneInfo.zonesStatus) throw new NotAcceptableException('ZONES_UNAVAILABLE')

    const carInfo = await this.carsService.findOne(car)
    if (!carInfo) throw new NotFoundException()
    if (carInfo.usersId !== user.usersId) throw new NotAcceptableException('CAR_UNDEFIND')

    const reserveInfo = await this.reservesService.foundAndCount(startat, endat)
    if (reserveInfo) throw new NotAcceptableException('RESERVE_UNAVAILABLE')

    const unit = (new Date(endat).getTime() - new Date(startat).getTime()) / 60000
    if (unit % zoneInfo.spaces.spacesUnit !== 0) throw new NotAcceptableException('COST_UNAVAILABLE')
    const amount = (zoneInfo.spaces.spacesDefaultCost + zoneInfo.zonesCost) * unit - point
    if (amount < 0) throw new NotAcceptableException('COST_TOO_LOW')

    const reserve = await this.reservesService.createReserve(zoneInfo.zonesId, user.usersId, startat, endat)
    const order = await this.ordersRepository.insert({
      usersId: user.usersId,
      carsId: carInfo.carsId,
      zonesId: zoneInfo.zonesId,
      reservesId: reserve,
      ordersAmount: amount,
      ordersPoint: point,
      ordersMethod: method
    })
    const orderResult = order.generatedMaps[0] as Orders
    return {
      orderId: orderResult.ordersId,
      orderAmount: orderResult.ordersAmount
    }
  }

  async confirmOrder (userId: number, ordersId: number, tossBody: ConfirmOrderBodyDto) {
    const order = await this.ordersRepository.findOneBy({ ordersId })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')
    if (order.usersId !== userId) throw new ForbiddenException('ORDER_UNAVAILABLE')
    if (order.ordersAmount !== tossBody.amount) {
      await request('https://api.tosspayments.com/v1/payments/' + tossBody.paymentKey + '/cancel')
      throw new NotAcceptableException('COST_MODIFIED')
    }

    const { body, statusCode } = await request('https://api.tosspayments.com/v1/brandpay/payments/confirm', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(this.configSerivce.get('TOSS_SECRET', '') + ':').toString('base64')}`
      },
      body: JSON.stringify({
        paymentKey: tossBody.paymentKey,
        orderId: ordersId,
        customerKey: userId
      })
    })

    const confirmBody = await body.json()
    if (statusCode !== 200) throw new NotAcceptableException(confirmBody.code)
    if (confirmBody.status !== 'DONE') throw new NotAcceptableException('ORDER_NOTCOMPLETED')
  }
}
