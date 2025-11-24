import type { Teacher } from '../types/types';
import { apiFetch, buildQuery } from './client';

export interface TeacherPayload {
  branchId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  department: string;
  noSaturday?: boolean;
}

interface TeacherResponse extends Omit<Teacher, 'createdAt'> {
  createdAt?: string;
}

const mapTeacher = (teacher: TeacherResponse): Teacher => ({
  ...teacher,
  createdAt: teacher.createdAt ? new Date(teacher.createdAt) : teacher.createdAt,
});

export async function fetchTeachers(params?: { branchId?: string; search?: string }) {
  const teachers = await apiFetch<TeacherResponse[]>(`/teachers${buildQuery(params ?? {})}`);
  return teachers.map(mapTeacher);
}

export async function createTeacher(payload: TeacherPayload) {
  const teacher = await apiFetch<TeacherResponse>('/teachers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapTeacher(teacher);
}

export async function updateTeacher(id: string, payload: Partial<TeacherPayload>) {
  const teacher = await apiFetch<TeacherResponse>(`/teachers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapTeacher(teacher);
}

export function deleteTeacher(id: string) {
  return apiFetch<void>(`/teachers/${id}`, {
    method: 'DELETE',
  });
}

