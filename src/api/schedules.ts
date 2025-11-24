import { apiFetch, buildQuery } from './client';
import type {
  ScheduleVersion,
  ScheduleType,
  WeekScheduleType,
  DayOfWeek,
} from '../types/types';

interface ScheduleResponse extends Omit<ScheduleVersion, 'createdAt' | 'startDate' | 'endDate'> {
  createdAt: string;
  startDate?: string | null;
  endDate?: string | null;
  weekType: 'one_week' | 'two_weeks';
  type: 'template' | 'period';
  daysOfWeek: string[];
}

function mapSchedule(schedule: ScheduleResponse): ScheduleVersion {
  return {
    ...schedule,
    daysOfWeek: schedule.daysOfWeek as DayOfWeek[],
    createdAt: new Date(schedule.createdAt),
    startDate: schedule.startDate ? new Date(schedule.startDate) : undefined,
    endDate: schedule.endDate ? new Date(schedule.endDate) : undefined,
  };
}

export async function fetchSchedules(params: { organizationId?: string; branchId?: string }) {
  const schedules = await apiFetch<ScheduleResponse[]>(
    `/schedules${buildQuery({
      organizationId: params.organizationId,
      branchId: params.branchId,
    })}`,
  );
  return schedules.map(mapSchedule);
}

interface SchedulePayload {
  organizationId: string;
  branchId: string;
  name: string;
  type: ScheduleType;
  weekType: WeekScheduleType;
  daysOfWeek: DayOfWeek[];
  lessonsPerDay: number;
  startDate?: string;
  endDate?: string;
}

function mapSchedulePayload(payload: SchedulePayload) {
  return {
    organizationId: payload.organizationId,
    branchId: payload.branchId,
    name: payload.name,
    type: payload.type === 'template' ? 'TEMPLATE' : 'PERIOD',
    weekType: payload.weekType === 'one_week' ? 'ONE_WEEK' : 'TWO_WEEKS',
    daysOfWeek: payload.daysOfWeek.map((day) => day.toUpperCase()),
    lessonsPerDay: payload.lessonsPerDay,
    startDate: payload.startDate ?? null,
    endDate: payload.endDate ?? null,
  };
}

export async function createSchedule(payload: SchedulePayload) {
  const schedule = await apiFetch<ScheduleResponse>('/schedules', {
    method: 'POST',
    body: JSON.stringify(mapSchedulePayload(payload)),
  });
  return mapSchedule(schedule);
}

export async function updateSchedule(id: string, payload: Partial<SchedulePayload>) {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    body.name = payload.name;
  }
  if (payload.type) {
    body.type = payload.type === 'template' ? 'TEMPLATE' : 'PERIOD';
  }
  if (payload.weekType) {
    body.weekType = payload.weekType === 'one_week' ? 'ONE_WEEK' : 'TWO_WEEKS';
  }
  if (payload.daysOfWeek) {
    body.daysOfWeek = payload.daysOfWeek.map((day) => day.toUpperCase());
  }
  if (payload.lessonsPerDay !== undefined) {
    body.lessonsPerDay = payload.lessonsPerDay;
  }
  if (payload.startDate !== undefined) {
    body.startDate = payload.startDate ?? null;
  }
  if (payload.endDate !== undefined) {
    body.endDate = payload.endDate ?? null;
  }

  const schedule = await apiFetch<ScheduleResponse>(`/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return mapSchedule(schedule);
}

export async function duplicateSchedule(id: string, name?: string) {
  const schedule = await apiFetch<ScheduleResponse>(`/schedules/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return mapSchedule(schedule);
}

export function deleteSchedule(id: string) {
  return apiFetch<void>(`/schedules/${id}`, { method: 'DELETE' });
}

