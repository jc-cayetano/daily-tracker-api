import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../auth/entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'updateduser' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.PROJECT_MANAGER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
