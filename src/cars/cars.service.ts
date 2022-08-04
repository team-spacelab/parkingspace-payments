import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cars } from './cars.entity'

@Injectable()
export class CarsService {
  constructor (
    @InjectRepository(Cars)
    private readonly carsRepository: Repository<Cars>
  ) {}

  async findOne (carsId: number) {
    return await this.carsRepository.findOneBy({ carsId })
  }
}
