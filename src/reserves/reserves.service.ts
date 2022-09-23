import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, LessThan, Repository } from 'typeorm'
import { Reserves } from 'parkingspace-commons'

@Injectable()
export class ReservesService {
  constructor (
    @InjectRepository(Reserves)
    private readonly reservesRepository: Repository<Reserves>
  ) {}

  async findOne (id: number, userId: number) {
    const reserve = await this.reservesRepository.findOne({ where: { id, userId } })
    if (!reserve) throw new NotFoundException('RESERVE_NOTFOUND')

    return reserve
  }

  async findByUser (id: number) {
    const reserves = await this.reservesRepository.find({
      where: { userId: id }
    })
    return reserves
  }

  async findByZone (id: number) {
    const reserve = await this.reservesRepository.findOne({
      where: { zoneId: id },
      select: { id: true, startAt: true, endAt: true, status: true }
    })
    if (!reserve) throw new NotFoundException('RESERVE_NOTFOUND')

    return reserve
  }

  async delete (id: number) {
    const reserve = await this.reservesRepository.findOne({ where: { id } })
    if (!reserve) throw new NotFoundException('RESERVE_NOTFOUND')

    await this.reservesRepository.delete({ id })
  }

  async update (id: number, status: number) {
    return this.reservesRepository.update({ id }, { status })
  }

  async findAndCount (start: Date, end: Date) {
    return await this.reservesRepository.count({
      where: [
        { startAt: Between(start, end), status: LessThan(2) },
        { endAt: Between(start, end), status: LessThan(2) },
        { startAt: start, status: LessThan(2) },
        { endAt: end, status: LessThan(2) }
      ]
    })
  }

  async create (zoneId: number, userId: number, startAt: Date, endAt: Date) {
    const reserve = await this.reservesRepository.insert({ zoneId, userId, startAt, endAt, status: 1 })
    return reserve.generatedMaps[0].id
  }
}
