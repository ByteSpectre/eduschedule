import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string, branchId?: string, search?: string) {
    return this.prisma.studyGroup.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { faculty: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(organizationId: string, dto: CreateGroupDto) {
    await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    return this.prisma.studyGroup.create({
      data: {
        organizationId,
        branchId: dto.branchId,
        name: dto.name,
        course: dto.course,
        faculty: dto.faculty,
        studentCount: dto.studentCount,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateGroupDto) {
    await this.ensureGroupBelongsToOrganization(id, organizationId);
    if (dto.branchId) {
      await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    }

    return this.prisma.studyGroup.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.ensureGroupBelongsToOrganization(id, organizationId);
    await this.prisma.studyGroup.delete({ where: { id } });
  }

  private async ensureGroupBelongsToOrganization(id: string, organizationId: string) {
    const group = await this.prisma.studyGroup.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!group || group.organizationId !== organizationId) {
      throw new NotFoundException('Группа не найдена');
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
