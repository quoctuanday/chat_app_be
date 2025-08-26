import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddFriendDto {
  @IsUUID()
  @IsNotEmpty()
  friend_id: string;
}
