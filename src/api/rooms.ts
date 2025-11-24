import type { Room } from '../types/types';
import { apiFetch, buildQuery } from './client';

export interface RoomPayload {
  branchId?: string;
  number: string;
  building: string;
  type: Room['type'];
  capacity: number;
}

type ApiRoomType = 'LECTURE' | 'COMPUTER' | 'LABORATORY' | 'REGULAR';

interface RoomResponse extends Omit<Room, 'type' | 'createdAt'> {
  type: ApiRoomType;
  createdAt?: string;
}

const roomTypeToApi = (type: Room['type']): ApiRoomType =>
  type.toUpperCase() as ApiRoomType;
const mapRoomResponse = (room: RoomResponse): Room => ({
  ...room,
  createdAt: room.createdAt ? new Date(room.createdAt) : room.createdAt,
  type: room.type.toLowerCase() as Room['type'],
});

export async function fetchRooms(params?: { branchId?: string; search?: string }) {
  const rooms = await apiFetch<RoomResponse[]>(`/rooms${buildQuery(params ?? {})}`);
  return rooms.map(mapRoomResponse);
}

export async function createRoom(payload: RoomPayload) {
  const room = await apiFetch<RoomResponse>('/rooms', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      type: roomTypeToApi(payload.type),
    }),
  });
  return mapRoomResponse(room);
}

export async function updateRoom(id: string, payload: Partial<RoomPayload>) {
  const room = await apiFetch<RoomResponse>(`/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...payload,
      ...(payload.type ? { type: roomTypeToApi(payload.type) } : {}),
    }),
  });
  return mapRoomResponse(room);
}

export function deleteRoom(id: string) {
  return apiFetch<void>(`/rooms/${id}`, {
    method: 'DELETE',
  });
}

