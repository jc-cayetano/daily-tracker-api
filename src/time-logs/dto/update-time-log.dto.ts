import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTimeLogDto {
  @ApiProperty({ example: 'Reviewed PR #42 and left comments' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
