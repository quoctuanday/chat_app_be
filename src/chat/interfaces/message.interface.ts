// interfaces/message.interface.ts
export interface MessageResponse {
  message_id: string;
  conversation_id: string;
  sender: {
    user_id: string;
    username: string;
    avatar_url?: string | null;
  };
  content?: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: Date;
  is_deleted: boolean;
  reactions?: Record<string, any>;
  reply_to?: MessageResponse;
  attachments?: AttachmentResponse[];
  statuses?: MessageStatusResponse[];
}

export interface AttachmentResponse {
  attachment_id: string;
  file_url: string;
  file_type: 'image' | 'video' | 'file' | 'audio';
  file_size?: number;
  thumbnail_url?: string | null;
  uploaded_at: Date;
}

export interface MessageStatusResponse {
  user_id: string;
  status: 'sent' | 'delivered' | 'read';
  updated_at: Date;
}
