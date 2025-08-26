import { IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  is_deleted?: boolean;

  @IsOptional()
  reactions?: any;
}
