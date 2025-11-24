import type { Subject } from '../types/types';
import { apiFetch, buildQuery } from './client';

export interface SubjectPayload {
  name: string;
  hours: number;
}

interface SubjectResponse extends Omit<Subject, 'createdAt'> {
  createdAt?: string;
}

const mapSubject = (subject: SubjectResponse): Subject => ({
  ...subject,
  createdAt: subject.createdAt ? new Date(subject.createdAt) : subject.createdAt,
});

export async function fetchSubjects(params?: { search?: string }) {
  const subjects = await apiFetch<SubjectResponse[]>(`/subjects${buildQuery(params ?? {})}`);
  return subjects.map(mapSubject);
}

export async function createSubject(payload: SubjectPayload) {
  const subject = await apiFetch<SubjectResponse>('/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapSubject(subject);
}

export async function updateSubject(id: string, payload: Partial<SubjectPayload>) {
  const subject = await apiFetch<SubjectResponse>(`/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapSubject(subject);
}

export function deleteSubject(id: string) {
  return apiFetch<void>(`/subjects/${id}`, {
    method: 'DELETE',
  });
}

