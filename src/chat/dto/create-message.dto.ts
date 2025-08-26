import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsUUID()
  reply_to_id?: string;

  @IsOptional()
  message_type?: 'text' | 'image' | 'file' | 'system';
}
