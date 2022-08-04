import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNumber, IsString } from 'class-validator'

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

  @IsString()
  @ApiProperty()
    method: string

  @IsDateString()
  @ApiProperty()
    startat: Date

  @IsDateString()
  @ApiProperty()
    endat: Date
}
