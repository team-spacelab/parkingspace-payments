import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Zones } from './zones.entity'

@Injectable()
export class ZonesService {
  constructor (
    @InjectRepository(Zones)
    private readonly zonesRepository: Repository<Zones>
  ) {}

  async findOne (zonesId: number) {
    return await this.zonesRepository.findOne({ where: { zonesId }, relations: { spaces: true } })
  }
}
