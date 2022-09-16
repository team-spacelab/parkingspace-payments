import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GetAccessTokenQueryDto {
  @IsString()
  @ApiProperty()
    code: string

  @IsString()
  @ApiProperty()
    customerKey: string
}
