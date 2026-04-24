import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum LeaveRequestAction {
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateLeaveRequestDto {
  @ApiProperty({ enum: LeaveRequestAction, example: 'approved' })
  @IsEnum(LeaveRequestAction)
  @IsNotEmpty()
  status: LeaveRequestAction;
}
