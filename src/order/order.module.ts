import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { UsersModule } from 'src/users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Orders, Spaces } from 'parkingspace-commons'
import { ZonesModule } from 'src/zones/zones.module'
import { CarsModule } from 'src/cars/cars.module'
import { ReservesModule } from 'src/reserves/reserves.module'
import { PgModule } from 'src/pg/pg.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, Spaces]),
    UsersModule,
    ZonesModule,
    CarsModule,
    ReservesModule,
    PgModule
  ],
  providers: [ConfigService, OrderService],
  controllers: [OrderController]
})
export class OrderModule {}
