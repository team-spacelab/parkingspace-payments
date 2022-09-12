import {
  InternalServerErrorException,
  NotAcceptableException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { CarsService } from 'src/cars/cars.service'
import { ReservesService } from 'src/reserves/reserves.service'
import { UsersService } from 'src/users/users.service'
import { ZonesService } from 'src/zones/zones.service'
import { Repository } from 'typeorm'
import { request } from 'undici'
import { HttpMethod } from 'undici/types/dispatcher'
import { ConfirmOrderBodyDto } from './dto/ConfirmOrderBody.dto'
import { GenerateOrderBodyDto } from './dto/GenerateOrderBody.dto'
import { Orders } from 'parkingspace-commons'
import { randomUUID } from 'crypto'

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
    const { statusCode, responseBody } = await this.requestToss('/v1/brandpay/payments/methods/' + userId, 'GET')
    if (statusCode !== 200) throw new NotAcceptableException(responseBody.code)
    const { isIdentified, selectedMethodId, cards, accounts } = responseBody
    return {
      default: selectedMethodId,
      methods: isIdentified ? [].concat(cards, accounts) : []
    }
  }

  async generateOrder (userId: number, body: GenerateOrderBodyDto) {
    const { zone, point, car, method, startat, endat } = body
    const user = await this.usersService.findOne(userId)
    if (!user) throw new UnauthorizedException()
    if (user.point < point) throw new NotAcceptableException('USER_POINT_TOO_LOW')

    const zoneInfo = await this.zonesService.findOne(zone)
    if (!zoneInfo) throw new NotFoundException()
    if (zoneInfo.parentSpace.status !== 1) throw new NotAcceptableException('SPACE_UNAVAILABLE')
    if (!zoneInfo.status) throw new NotAcceptableException('ZONES_UNAVAILABLE')

    const carInfo = await this.carsService.findOne(car)
    if (!carInfo) throw new NotFoundException()
    if (carInfo.userId !== user.id) throw new NotAcceptableException('CAR_UNDEFIND')

    const reserveInfo = await this.reservesService.foundAndCount(startat, endat)
    if (reserveInfo) throw new NotAcceptableException('RESERVE_UNAVAILABLE')

    const unit = (new Date(endat).getTime() - new Date(startat).getTime()) / 60000
    if (unit % zoneInfo.parentSpace.timeUnit !== 0) throw new NotAcceptableException('COST_UNAVAILABLE')

    const amount = (zoneInfo.parentSpace.defaultCost + zoneInfo.costDiffrence) * unit - point
    if (amount < 0) throw new NotAcceptableException('COST_TOO_LOW')

    const reserve = await this.reservesService.createReserve(zoneInfo.id, user.id, startat, endat)
    const order = await this.ordersRepository.insert({
      id: randomUUID(),
      carId: carInfo.id,
      zoneId: zoneInfo.id,
      userId: user.id,
      reserveId: reserve,
      amount,
      point,
      method
    })

    return {
      orderId: order.identifiers[0].id,
      orderAmount: amount
    }
  }

  async confirmOrder (userId: number, orderId: string, tossBody: ConfirmOrderBodyDto) {
    const order = await this.ordersRepository.findOneBy({ id: orderId })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')
    if (order.userId !== userId) throw new ForbiddenException('ORDER_UNAVAILABLE')
    if (order.amount !== tossBody.amount) {
      await this.requestToss('/v1/payments/' + tossBody.paymentKey + '/cancel', 'POST')
      throw new NotAcceptableException('COST_MODIFIED')
    }

    const { responseBody } =
      await this.requestToss('/v1/brandpay/payments/confirm', 'POST', {
        paymentKey: tossBody.paymentKey,
        orderId,
        customerKey: userId
      })

    if (responseBody.status !== 'DONE') throw new NotAcceptableException('ORDER_NOTCOMPLETED')
    this.updateOrder(orderId, 3)
  }

  private async updateOrder (id: string, status?: number, receipt?: string) {
    const order = await this.ordersRepository.findOneBy({ id })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')

    await this.ordersRepository.update({ id: order.id }, {
      ...(status === undefined ? {} : { status }),
      ...(receipt === undefined ? {} : { receipt })
    })
  }

  private async requestToss (url: string, method: HttpMethod, requestBody?: any) {
    const secret = Buffer.from(this.configSerivce.get('TOSS_SECRET', '') + ':').toString('base64')
    const { body, statusCode } = await request('https://api.tosspayments.com' + url, {
      method,
      body: JSON.stringify(requestBody),
      headers: { authorization: `Basic ${secret}` }
    })

    const responseBody = await body.json()
    if (statusCode === 400) throw new BadRequestException(responseBody.code)
    if (statusCode === 404) throw new NotFoundException(responseBody.code)
    if (statusCode === 403) throw new InternalServerErrorException(responseBody.code)
    if (statusCode === 500) throw new InternalServerErrorException(responseBody.code)
    if (statusCode !== 200) throw new InternalServerErrorException('')

    return { statusCode, responseBody }
  }
}
