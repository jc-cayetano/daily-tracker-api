import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Code Review' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
