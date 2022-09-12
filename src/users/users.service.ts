import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Users } from '../../../commons/dist/entity'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}

  public async findOne (id: number) {
    return await this.usersRepository.findOne({ where: { id } })
  }
}
