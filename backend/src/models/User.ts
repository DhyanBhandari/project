export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  provider: string;
  created_at: Date;
  updated_at: Date;
}
