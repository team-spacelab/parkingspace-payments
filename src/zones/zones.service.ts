import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Zones } from 'parkingspace-commons'

@Injectable()
export class ZonesService {
  constructor (
    @InjectRepository(Zones)
    private readonly zonesRepository: Repository<Zones>
  ) {}

  async findOne (id: number) {
    return await this.zonesRepository.findOne({ where: { id }, relations: { parentSpace: true } })
  }
}
