import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthMiddleware } from './auth/auth.middleware'
import { AuthModule } from './auth/auth.module'
import { PaymentModule } from './payment/payment.module'

@Module({
  imports: [TypeOrmModule.forRoot(), ConfigModule.forRoot(), AuthModule, PaymentModule]
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*')
  }
}
