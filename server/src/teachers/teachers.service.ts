import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string, branchId?: string, search?: string) {
    return this.prisma.teacher.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        ...(search
          ? {
              OR: [
                {
                  lastName: { contains: search, mode: 'insensitive' },
                },
                {
                  firstName: { contains: search, mode: 'insensitive' },
                },
                {
                  department: { contains: search, mode: 'insensitive' },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async create(organizationId: string, dto: CreateTeacherDto) {
    if (dto.branchId) {
      await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    }

    return this.prisma.teacher.create({
      data: {
        organizationId,
        branchId: dto.branchId ?? null,
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        department: dto.department,
        preferences: dto.noSaturday ? { noSaturday: true } : Prisma.JsonNull,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateTeacherDto) {
    await this.ensureTeacherBelongsToOrganization(id, organizationId);
    if (dto.branchId) {
      await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    }

    const { noSaturday, ...rest } = dto;
    return this.prisma.teacher.update({
      where: { id },
      data: {
        ...rest,
        ...(noSaturday !== undefined
          ? { preferences: noSaturday ? { noSaturday: true } : Prisma.JsonNull }
          : {}),
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.ensureTeacherBelongsToOrganization(id, organizationId);
    await this.prisma.teacher.delete({ where: { id } });
  }

  private async ensureTeacherBelongsToOrganization(id: string, organizationId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!teacher || teacher.organizationId !== organizationId) {
      throw new NotFoundException('Преподаватель не найден');
    }
  }

  private async ensureBranchBelongsToOrganization(branchId: string, organizationId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { organizationId: true },
    });

    if (!branch || branch.organizationId !== organizationId) {
      throw new NotFoundException('Филиал не найден');
    }
  }
}
