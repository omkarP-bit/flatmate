import { create } from 'zustand';
import { Room, RoomMember } from '../types/room.types';
import { roomApi } from '../api/roomApi';

interface RoomState {
  rooms: Room[];
  activeRoomId: number | null;
  members: RoomMember[];
  loading: boolean;
  error: string | null;

  setActiveRoom: (roomId: number) => void;
  fetchMyRooms: () => Promise<void>;
  fetchMembers: (roomId: number) => Promise<void>;
  createRoom: (name: string, address?: string) => Promise<Room>;
  joinRoom: (code: string) => Promise<void>;
  removeMember: (roomId: number, userId: string) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  members: [],
  loading: false,
  error: null,

  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

  fetchMyRooms: async () => {
    set({ loading: true, error: null });
    try {
      const rooms = await roomApi.getMine();
      set({ rooms, activeRoomId: rooms[0]?.id ?? null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchMembers: async (roomId) => {
    set({ loading: true });
    try {
      const members = await roomApi.getMembers(roomId);
      set({ members });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  createRoom: async (name, address) => {
    const room = await roomApi.create({ name, address });
    set(state => ({ rooms: [...state.rooms, room], activeRoomId: room.id }));
    return room;
  },

  joinRoom: async (code) => {
    await roomApi.join({ room_code: code.toUpperCase() });
    await get().fetchMyRooms();
  },

  removeMember: async (roomId, userId) => {
    await roomApi.removeMember(roomId, userId);
    set(state => ({ members: state.members.filter(m => m.user_id !== userId) }));
  },
}));