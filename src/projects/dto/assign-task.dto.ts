import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ example: 'uuid-of-assignee' })
  @IsUUID()
  @IsNotEmpty()
  assigneeId: string;
}
