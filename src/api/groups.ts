import type { Group } from '../types/types';
import { apiFetch, buildQuery } from './client';

export interface GroupPayload {
  branchId: string;
  name: string;
  course: number;
  faculty: string;
  studentCount: number;
}

interface GroupResponse extends Omit<Group, 'createdAt'> {
  createdAt?: string;
}

const mapGroup = (group: GroupResponse): Group => ({
  ...group,
  createdAt: group.createdAt ? new Date(group.createdAt) : group.createdAt,
});

export async function fetchGroups(params?: { branchId?: string; search?: string }) {
  const groups = await apiFetch<GroupResponse[]>(`/groups${buildQuery(params ?? {})}`);
  return groups.map(mapGroup);
}

export async function createGroup(payload: GroupPayload) {
  const group = await apiFetch<GroupResponse>('/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapGroup(group);
}

export async function updateGroup(id: string, payload: Partial<GroupPayload>) {
  const group = await apiFetch<GroupResponse>(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapGroup(group);
}

export function deleteGroup(id: string) {
  return apiFetch<void>(`/groups/${id}`, {
    method: 'DELETE',
  });
}

