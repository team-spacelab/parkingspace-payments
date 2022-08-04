import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Zones } from './zones.entity'
import { ZonesService } from './zones.service'

@Module({
  imports: [TypeOrmModule.forFeature([Zones])],
  providers: [ZonesService],
  exports: [ZonesService]
})
export class ZonesModule {}
