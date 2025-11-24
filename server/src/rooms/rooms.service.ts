import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string, branchId?: string, search?: string) {
    return this.prisma.room.findMany({
      where: {
        organizationId,
        ...(branchId ? { branchId } : {}),
        ...(search
          ? {
              OR: [
                { number: { contains: search, mode: 'insensitive' } },
                { building: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ building: 'asc' }, { number: 'asc' }],
    });
  }

  async create(organizationId: string, dto: CreateRoomDto) {
    if (dto.branchId) {
      await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    }

    return this.prisma.room.create({
      data: {
        organizationId,
        branchId: dto.branchId ?? null,
        number: dto.number,
        building: dto.building,
        capacity: dto.capacity,
        type: dto.type ?? RoomType.REGULAR,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateRoomDto) {
    await this.ensureRoomBelongsToOrganization(id, organizationId);
    if (dto.branchId) {
      await this.ensureBranchBelongsToOrganization(dto.branchId, organizationId);
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.ensureRoomBelongsToOrganization(id, organizationId);
    await this.prisma.room.delete({ where: { id } });
  }

  private async ensureRoomBelongsToOrganization(id: string, organizationId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!room || room.organizationId !== organizationId) {
      throw new NotFoundException('Аудитория не найдена');
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
