import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { CryptoModule, DBConfigService, HealthModule, LoggerModule, ResolveTokenMiddleware } from 'parkingspace-commons'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderModule } from './order/order.module'
import { PgModule } from './pg/pg.module';

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
    CryptoModule,
    PgModule
  ]
})
export class AppModule implements NestModule {
  public configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(ResolveTokenMiddleware)
      .forRoutes('/')
  }
}
