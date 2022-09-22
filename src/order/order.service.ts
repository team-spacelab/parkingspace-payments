import {
  NotAcceptableException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Injectable
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CarsService } from 'src/cars/cars.service'
import { ReservesService } from 'src/reserves/reserves.service'
import { UsersService } from 'src/users/users.service'
import { ZonesService } from 'src/zones/zones.service'
import { Repository } from 'typeorm'
import { ConfirmOrderBodyDto } from './dto/ConfirmOrderBody.dto'
import { GenerateOrderBodyDto } from './dto/GenerateOrderBody.dto'
import { CarStatus, Orders, OrderStatus } from 'parkingspace-commons'
import { randomUUID } from 'crypto'
import { PgService } from 'src/pg/pg.service'

@Injectable()
export class OrderService {
  constructor (
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly reservesService: ReservesService,
    private readonly zonesService: ZonesService,
    private readonly usersService: UsersService,
    private readonly carsService: CarsService,
    private readonly pgService: PgService
  ) {}

  async findOne (id: string, userId: number) {
    const order = await this.ordersRepository.findOne({ where: { id, userId } })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')

    return order
  }

  async findByUserId (userId: number) {
    const orders = await this.ordersRepository.find({ where: { userId } })
    return orders
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
    if (carInfo.userId !== user.id) throw new NotAcceptableException('CAR_UNAVAILABLE')
    if (carInfo.status === CarStatus.DELETED) throw new NotAcceptableException('CAR_UNAVAILABLE')

    const reserveInfo = await this.reservesService.findAndCount(startat, endat)
    if (reserveInfo) throw new NotAcceptableException('RESERVE_UNAVAILABLE')

    const amount = Math.floor((new Date(endat).getTime() - new Date(startat).getTime()) / (zoneInfo.parentSpace.timeUnit * 60 * 1000) * zoneInfo.parentSpace.defaultCost) - point
    if (amount < 0) throw new NotAcceptableException('COST_TOO_LOW')

    const reserve = await this.reservesService.create(zoneInfo.id, user.id, startat, endat)
    const order = await this.ordersRepository.insert({
      id: randomUUID(),
      carId: carInfo.id,
      zoneId: zoneInfo.id,
      userId: user.id,
      reserveId: reserve,
      amount,
      point,
      method,
      status: amount === 0 ? OrderStatus.DONE : OrderStatus.READY
    })

    return {
      orderId: order.identifiers[0].id,
      orderAmount: amount
    }
  }

  async confirmOrder (userId: number, tossBody: ConfirmOrderBodyDto) {
    const order = await this.ordersRepository.findOneBy({ id: tossBody.orderId })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')
    if (order.userId !== userId) throw new ForbiddenException('ORDER_UNAVAILABLE')
    if (order.amount !== tossBody.amount) {
      this.pgService.cancelOrder(tossBody.paymentKey, '변조된 결제입니다.')
      this.cancelOrder(order.id, userId, OrderStatus.CANCELED)
      throw new NotAcceptableException('ORDER_TAMPERING')
    }

    const response = await this.pgService.confirmOrder(userId, tossBody.paymentKey, tossBody.orderId)
    if (response.status !== 200) {
      await this.updateOrder(tossBody.orderId, OrderStatus.CANCELED)
      throw new BadRequestException(response.message)
    }

    await this.usersService.updatePoint(userId, order.point * -1)
    await this.updateOrder(tossBody.orderId, OrderStatus.DONE, response.data.receipt)
  }

  private async updateOrder (id: string, status?: OrderStatus, receipt?: string) {
    const order = await this.ordersRepository.findOneBy({ id })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')

    await this.ordersRepository.update({ id: order.id }, {
      ...(status === undefined ? {} : { status }),
      ...(receipt === undefined ? {} : { receipt })
    })
  }

  async cancelOrder (id: string, userId: number, status: OrderStatus) {
    const order = await this.ordersRepository.findOneBy({ id })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')
    if (order.userId !== userId) throw new ForbiddenException('ORDER_UNAVAILABLE')

    await this.reservesService.delete(order.reserveId)
    await this.ordersRepository.update({ id: order.id }, { status })
  }

  async webhook (body: any) {
    if (body.eventType !== 'PAYMENT_STATUS_CHANGED') return
    const { orderId, status } = body.data
    const order = await this.ordersRepository.findOneBy({ id: orderId })
    if (!order) throw new NotFoundException('ORDER_NOTFOUND')

    if (status === 'CANCEL') {
      await this.reservesService.delete(order.reserveId)
      await this.ordersRepository.update({ id: order.id }, { status: OrderStatus.CANCELED })
    }
  }
}
