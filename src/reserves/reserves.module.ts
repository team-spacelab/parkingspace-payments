import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reserves } from 'parkingspace-commons'
import { ReservesService } from './reserves.service'

@Module({
  imports: [TypeOrmModule.forFeature([Reserves])],
  providers: [ReservesService],
  exports: [ReservesService]
})
export class ReservesModule {}
