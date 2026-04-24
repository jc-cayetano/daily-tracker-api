import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTimeLogDto {
  @ApiProperty({ example: 'uuid-of-task' })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;
}
