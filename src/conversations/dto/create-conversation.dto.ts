import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
