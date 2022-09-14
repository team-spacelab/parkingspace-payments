import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reserves } from 'parkingspace-commons'
import { ReservesService } from './reserves.service'
import { ReservesController } from './reserves.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reserves])],
  providers: [ReservesService],
  exports: [ReservesService],
  controllers: [ReservesController]
})
export class ReservesModule {}
