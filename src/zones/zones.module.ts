import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ZonesService } from './zones.service'
import { Zones, Spaces } from 'parkingspace-commons'

@Module({
  imports: [TypeOrmModule.forFeature([Zones, Spaces])],
  providers: [ZonesService],
  exports: [ZonesService]
})
export class ZonesModule {}
