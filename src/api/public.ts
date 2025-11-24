import { apiFetch, buildQuery } from './client';

export interface PublicCity {
  id: string;
  name: string;
  organizationCount: number;
  sampleOrganizations: string[];
}

export interface PublicOrganization {
  id: string;
  name: string;
  type: 'university' | 'college' | 'school';
  city: string;
  branchCount: number;
}

export interface PublicBranch {
  id: string;
  organizationId: string;
  name: string;
  type: 'university' | 'college' | 'school';
  city: string;
  address: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PublicSchedule {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  type: 'template' | 'period';
  weekType: 'one_week' | 'two_weeks';
  daysOfWeek: string[];
  lessonsPerDay: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

export function fetchCities() {
  return apiFetch<PublicCity[]>('/public/cities', { skipAuth: true });
}

export function fetchPublicOrganizations(city?: string) {
  return apiFetch<PublicOrganization[]>(`/public/organizations${buildQuery({ city })}`, {
    skipAuth: true,
  });
}

export function fetchPublicBranches(organizationId: string) {
  return apiFetch<PublicBranch[]>(`/public/branches${buildQuery({ organizationId })}`, {
    skipAuth: true,
  });
}

export function fetchPublicSchedules(branchId: string) {
  return apiFetch<PublicSchedule[]>(`/public/schedules${buildQuery({ branchId })}`, {
    skipAuth: true,
  });
}

