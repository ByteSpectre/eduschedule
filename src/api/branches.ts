import { apiFetch, buildQuery } from './client';
import type { Branch, BranchType } from '../types/types';

interface BranchResponse extends Omit<Branch, 'createdAt'> {
  createdAt: string;
}

function mapBranch(branch: BranchResponse): Branch {
  return {
    ...branch,
    createdAt: new Date(branch.createdAt),
  };
}

export async function fetchBranches(organizationId?: string) {
  const branches = await apiFetch<BranchResponse[]>(
    `/branches${buildQuery({ organizationId })}`,
  );
  return branches.map(mapBranch);
}

interface BranchPayload {
  organizationId: string;
  name: string;
  type: BranchType;
  city: string;
  address: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
}

export async function createBranch(payload: BranchPayload) {
  const body = {
    ...payload,
    type: payload.type.toUpperCase(),
  };
  const branch = await apiFetch<BranchResponse>('/branches', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapBranch(branch);
}

export async function updateBranch(id: string, payload: Partial<BranchPayload>) {
  const body = {
    ...payload,
    type: payload.type ? payload.type.toUpperCase() : undefined,
  };
  const branch = await apiFetch<BranchResponse>(`/branches/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return mapBranch(branch);
}

export function deleteBranch(id: string) {
  return apiFetch<void>(`/branches/${id}`, {
    method: 'DELETE',
  });
}

