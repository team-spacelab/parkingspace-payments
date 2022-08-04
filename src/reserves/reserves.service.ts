import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Reserves } from './reserves.entity'

@Injectable()
export class ReservesService {
  constructor (
    @InjectRepository(Reserves)
    private readonly reservesRepository: Repository<Reserves>
  ) {}

  async foundAndCount (startat: Date, endat: Date) {
    return await this.reservesRepository.count({
      where: [
        { reservesStartat: Between(startat, endat) },
        { reservesEndat: Between(startat, endat) }
      ]
    })
  }

  async createReserve (zonesId: number, usersId: number, startat: Date, endat: Date) {
    const reserve = await this.reservesRepository.insert({
      zonesId, usersId, reservesStartat: startat, reservesEndat: endat, reservesStatus: 1
    })
    return reserve.generatedMaps[0].reservesId
  }
}
