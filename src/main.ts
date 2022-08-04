import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { setupCommons } from 'parkingspace-commons'

async function bootstrap () {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = new DocumentBuilder()
    .setTitle('PaymentServer@ParkingSpace')
    .setDescription('Order & Payments')
    .setVersion('1.0')
    .build()

  setupCommons(app, 'payment')

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  await app.listen(3000)
}
bootstrap()
