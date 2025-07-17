export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'assistant' | 'system';
  content_embedding?: number[];
  token_count?: number;
  model_used?: string;
  created_at: Date;
}
