import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemoveMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
