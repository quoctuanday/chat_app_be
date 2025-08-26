export type ConversationType = 'private' | 'group';
export type MemberRole = 'admin' | 'member';

export class ConversationMemberDto {
  user_id: string;
  username: string;
  avatar_url?: string | null;
  role: MemberRole;
  joined_at: Date;
  status?: 'online' | 'offline';
}

export class LastMessageDto {
  message_id: string;
  content: string;
  created_at: Date;
  sender: {
    user_id: string;
    username: string;
    avatar_url?: string | null;
  };
}

export class ConversationResponseDto {
  conversation_id: string;
  type: ConversationType;
  name: string;
  created_at: Date;
  created_by_id?: string | null;

  members: ConversationMemberDto[];

  lastMessage?: LastMessageDto;
  unreadCount: number;
  online?: boolean;
  initials: string;
}
