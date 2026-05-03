export interface Room {
  id: number;
  name: string;
  address?: string;
  room_code: string;
  created_by: string;
  created_at: string;
}

export interface RoomMember {
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  name?: string;
  email?: string;
  upi_id?: string;
  avatar_url?: string;
}

export interface RoomCreate {
  name: string;
  address?: string;
}

export interface RoomJoin {
  room_code: string;
}