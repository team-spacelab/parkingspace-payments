import { Module } from '@nestjs/common'
import { CryptoModule, DBConfigService, HealthModule, LoggerModule } from 'parkingspace-commons'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderModule } from './order/order.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: DBConfigService
    }),
    OrderModule,
    LoggerModule,
    HealthModule,
    CryptoModule
  ]
})
export class AppModule {}
