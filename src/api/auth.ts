import { apiFetch } from './client';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'EDITOR' | 'VIEWER';
    organizationId?: string | null;
    branchId?: string | null;
  };
}

export interface RegisterOrganizationPayload {
  organizationName: string;
  organizationType: 'university' | 'college' | 'school';
  city: string;
  email: string;
  password: string;
  branchName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerOrganization(payload: RegisterOrganizationPayload) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      organizationType: payload.organizationType.toUpperCase(),
    }),
    skipAuth: true,
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function fetchProfile() {
  return apiFetch<AuthResponse['user']>('/auth/me');
}

