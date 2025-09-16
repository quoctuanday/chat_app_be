// update-user.dto.ts
import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserStatus } from '../../../generated/prisma';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
