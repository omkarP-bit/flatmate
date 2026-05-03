export interface User {
  id: string;
  name: string;
  email: string;
  upi_id?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdate {
  name?: string;
  upi_id?: string;
  phone?: string;
  avatar_key?: string;
}

export interface AvatarUploadResponse {
  upload_url: string;
  key: string;
  expires_in: number;
}