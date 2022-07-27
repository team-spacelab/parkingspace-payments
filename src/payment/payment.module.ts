import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from 'src/auth/auth.service'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, AuthService, JwtService]
})
export class PaymentModule {}
