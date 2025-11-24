import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string, search?: string) {
    return this.prisma.subject.findMany({
      where: {
        organizationId,
        ...(search
          ? {
              name: { contains: search, mode: 'insensitive' },
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  create(organizationId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        organizationId,
        name: dto.name,
        hours: dto.hours,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateSubjectDto) {
    await this.ensureSubjectBelongsToOrganization(id, organizationId);
    return this.prisma.subject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.ensureSubjectBelongsToOrganization(id, organizationId);
    await this.prisma.subject.delete({ where: { id } });
  }

  private async ensureSubjectBelongsToOrganization(id: string, organizationId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!subject || subject.organizationId !== organizationId) {
      throw new NotFoundException('Предмет не найден');
    }
  }
}
