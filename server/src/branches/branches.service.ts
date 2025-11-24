import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        ...dto,
        contactEmail: dto.contactEmail ?? null,
        contactPhone: dto.contactPhone ?? null,
      },
    });
  }

  findAll(organizationId?: string) {
    return this.prisma.branch.findMany({
      where: organizationId ? { organizationId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException('Филиал не найден');
    }
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.ensureExists(id);
    return this.prisma.branch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.branch.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.branch.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Филиал не найден');
    }
  }
}
