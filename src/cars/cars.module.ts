import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cars } from 'parkingspace-commons'
import { CarsService } from './cars.service'

@Module({
  imports: [TypeOrmModule.forFeature([Cars])],
  providers: [CarsService],
  exports: [CarsService]
})
export class CarsModule {}
