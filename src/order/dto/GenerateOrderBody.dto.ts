import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNumber } from 'class-validator'

export class GenerateOrderBodyDto {
  @IsNumber()
  @ApiProperty()
    zone: number

  @IsNumber()
  @ApiProperty()
    point: number

  @IsNumber()
  @ApiProperty()
    car: number

  @IsNumber()
  @ApiProperty()
    method: number

  @IsDateString()
  @ApiProperty()
    startat: Date

  @IsDateString()
  @ApiProperty()
    endat: Date
}
