import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cars } from 'parkingspace-commons'

@Injectable()
export class CarsService {
  constructor (
    @InjectRepository(Cars)
    private readonly carsRepository: Repository<Cars>
  ) {}

  async findOne (id: number) {
    return await this.carsRepository.findOneBy({ id })
  }
}
