export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}
