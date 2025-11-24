import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Branch,
  BranchType,
  DayOfWeek,
  OrganizationType,
  ScheduleType,
  WeekScheduleType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface PublicCity {
  id: string;
  name: string;
  organizationCount: number;
  sampleOrganizations: string[];
}

export interface PublicOrganization {
  id: string;
  name: string;
  type: string;
  city: string;
  branchCount: number;
}

export interface PublicBranch {
  id: string;
  organizationId: string;
  name: string;
  type: string;
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
  type: string;
  weekType: string;
  daysOfWeek: string[];
  lessonsPerDay: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getCities(): Promise<PublicCity[]> {
    const organizations = await this.prisma.organization.findMany({
      where: { isActive: true },
      select: { city: true, name: true },
    });

    const cityMap = new Map<string, { name: string; organizations: string[] }>();

    organizations.forEach(({ city, name }) => {
      const normalizedCity = city.trim();
      if (!cityMap.has(normalizedCity)) {
        cityMap.set(normalizedCity, { name: normalizedCity, organizations: [] });
      }
      cityMap.get(normalizedCity)?.organizations.push(name);
    });

    return Array.from(cityMap.values()).map((city) => ({
      id: city.name,
      name: city.name,
      organizationCount: city.organizations.length,
      sampleOrganizations: city.organizations.slice(0, 3),
    }));
  }

  async getOrganizations(city?: string): Promise<PublicOrganization[]> {
    const organizations = await this.prisma.organization.findMany({
      where: {
        isActive: true,
        ...(city
          ? {
              city: {
                equals: city,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      include: {
        branches: {
          where: { isActive: true },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      type: this.mapOrganizationType(organization.type),
      city: organization.city,
      branchCount: organization.branches.length,
    }));
  }

  async getBranches(organizationId: string): Promise<PublicBranch[]> {
    const organizationExists = await this.prisma.organization.count({
      where: { id: organizationId, isActive: true },
    });

    if (!organizationExists) {
      throw new NotFoundException('Организация не найдена или неактивна');
    }

    const branches = await this.prisma.branch.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return branches.map((branch) => this.mapBranch(branch));
  }

  async getSchedules(branchId: string): Promise<PublicSchedule[]> {
    const branchExists = await this.prisma.branch.count({
      where: { id: branchId, isActive: true },
    });

    if (!branchExists) {
      throw new NotFoundException('Филиал не найден или неактивен');
    }

    const schedules = await this.prisma.scheduleVersion.findMany({
      where: { branchId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return schedules.map((schedule) => this.mapSchedule(schedule));
  }

  private mapOrganizationType(type: OrganizationType): string {
    return type.toLowerCase();
  }

  private mapBranchType(type: BranchType): string {
    return type.toLowerCase();
  }

  private mapBranch(branch: Branch): PublicBranch {
    return {
      id: branch.id,
      organizationId: branch.organizationId,
      name: branch.name,
      type: this.mapBranchType(branch.type),
      city: branch.city,
      address: branch.address,
      contactEmail: branch.contactEmail,
      contactPhone: branch.contactPhone,
      isActive: branch.isActive,
      createdAt: branch.createdAt.toISOString(),
    };
  }

  private mapSchedule(schedule: {
    id: string;
    organizationId: string;
    branchId: string;
    name: string;
    type: ScheduleType;
    weekType: WeekScheduleType;
    daysOfWeek: DayOfWeek[];
    lessonsPerDay: number;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
  }): PublicSchedule {
    return {
      id: schedule.id,
      organizationId: schedule.organizationId,
      branchId: schedule.branchId,
      name: schedule.name,
      type: this.mapScheduleType(schedule.type),
      weekType: this.mapWeekType(schedule.weekType),
      daysOfWeek: schedule.daysOfWeek.map((day) => day.toLowerCase()),
      lessonsPerDay: schedule.lessonsPerDay,
      startDate: schedule.startDate ? schedule.startDate.toISOString() : null,
      endDate: schedule.endDate ? schedule.endDate.toISOString() : null,
      createdAt: schedule.createdAt.toISOString(),
    };
  }

  private mapScheduleType(type: ScheduleType): string {
    return type === 'TEMPLATE' ? 'template' : 'period';
  }

  private mapWeekType(type: WeekScheduleType): string {
    return type === 'ONE_WEEK' ? 'one_week' : 'two_weeks';
  }
}

