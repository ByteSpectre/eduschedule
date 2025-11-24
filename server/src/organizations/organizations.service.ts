import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({
      include: {
        branches: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: { branches: true },
    });
    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }
    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.ensureExists(id);
    return this.prisma.organization.update({
      where: { id },
      data: {
        ...dto,
        subscriptionEndAt: dto.subscriptionEndAt
          ? new Date(dto.subscriptionEndAt)
          : undefined,
      },
    });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.organization.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Организация не найдена');
    }
  }
}
