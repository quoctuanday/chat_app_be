export type ConversationType = 'private' | 'group';

export type MemberRole = 'admin' | 'member';

export interface ConversationMemberInterface {
  user_id: string;
  username: string;
  avatar_url?: string | null;
  role: MemberRole;
  joined_at: Date;
}

export interface ConversationInterface {
  conversation_id: string;
  type: ConversationType;
  name?: string | null;
  created_at: Date;
  created_by_id?: string | null;

  members?: ConversationMemberInterface[];
}
