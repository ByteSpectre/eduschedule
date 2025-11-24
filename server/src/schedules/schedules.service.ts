import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DayOfWeek, ScheduleType, WeekScheduleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { DuplicateScheduleDto } from './dto/duplicate-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: { organizationId?: string; branchId?: string }) {
    return this.prisma.scheduleVersion.findMany({
      where: {
        organizationId: filters.organizationId,
        branchId: filters.branchId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateScheduleDto) {
    await this.ensureBranchBelongsToOrg(dto.branchId, dto.organizationId);

    const data = this.normalizeScheduleDto(dto);
    await this.ensurePeriodDoesNotOverlap(
      data.branchId,
      data.type,
      data.startDate,
      data.endDate,
    );

    return this.prisma.scheduleVersion.create({
      data,
    });
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const existing = await this.prisma.scheduleVersion.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Расписание не найдено');
    }

    if (dto.daysOfWeek && dto.daysOfWeek.length === 0) {
      throw new BadRequestException('Необходимо указать дни недели');
    }

    if (
      dto.lessonsPerDay &&
      (dto.lessonsPerDay < 1 || dto.lessonsPerDay > 18)
    ) {
      throw new BadRequestException('Количество уроков должно быть от 1 до 18');
    }

    const normalized = this.normalizeScheduleDto({
      organizationId: existing.organizationId,
      branchId: existing.branchId,
      name: dto.name ?? existing.name,
      type: dto.type ?? existing.type,
      weekType: existing.weekType,
      weekStartDay:
        dto.weekStartDay ?? existing.weekStartDay ?? DayOfWeek.MONDAY,
      daysOfWeek: dto.daysOfWeek ?? existing.daysOfWeek,
      lessonsPerDay: dto.lessonsPerDay ?? existing.lessonsPerDay,
      startDate: dto.startDate ?? existing.startDate,
      endDate: dto.endDate ?? existing.endDate,
    });

    await this.ensurePeriodDoesNotOverlap(
      existing.branchId,
      normalized.type,
      normalized.startDate,
      normalized.endDate,
      id,
    );

    return this.prisma.scheduleVersion.update({
      where: { id },
      data: {
        name: normalized.name,
        type: normalized.type,
        weekStartDay: normalized.weekStartDay,
        daysOfWeek: normalized.daysOfWeek,
        lessonsPerDay: normalized.lessonsPerDay,
        startDate: normalized.startDate,
        endDate: normalized.endDate,
      },
    });
  }

  async duplicate(id: string, dto: DuplicateScheduleDto) {
    const existing = await this.prisma.scheduleVersion.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Расписание не найдено');
    }

    const name = dto.name ?? `${existing.name} (копия)`;

    return this.prisma.scheduleVersion.create({
      data: {
        organizationId: existing.organizationId,
        branchId: existing.branchId,
        name,
        type: existing.type,
        weekType: existing.weekType,
        weekStartDay: existing.weekStartDay ?? DayOfWeek.MONDAY,
        daysOfWeek: existing.daysOfWeek,
        lessonsPerDay: existing.lessonsPerDay,
        startDate: existing.startDate ?? null,
        endDate: existing.endDate ?? null,
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.scheduleVersion.delete({ where: { id } });
  }

  private normalizeScheduleDto(dto: {
    organizationId: string;
    branchId: string;
    name: string;
    type?: ScheduleType;
    weekType: WeekScheduleType;
    weekStartDay?: DayOfWeek | null;
    daysOfWeek: DayOfWeek[];
    lessonsPerDay: number;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
  }) {
    const type = dto.type ?? ScheduleType.TEMPLATE;
    const daysOfWeek = [...new Set(dto.daysOfWeek)] as DayOfWeek[];

    if (type === ScheduleType.PERIOD) {
      if (!dto.startDate || !dto.endDate) {
        throw new BadRequestException(
          'Для расписания на период необходимо указать даты начала и окончания',
        );
      }
      if (new Date(dto.startDate) > new Date(dto.endDate)) {
        throw new BadRequestException(
          'Дата начала не может быть позже даты окончания',
        );
      }
    }

    const parseDate = (value?: string | Date | null) => {
      if (!value) {
        return null;
      }
      return value instanceof Date ? value : new Date(value);
    };

    return {
      organizationId: dto.organizationId,
      branchId: dto.branchId,
      name: dto.name,
      type,
      weekType: dto.weekType ?? WeekScheduleType.ONE_WEEK,
      weekStartDay: dto.weekStartDay ?? DayOfWeek.MONDAY,
      daysOfWeek,
      lessonsPerDay: dto.lessonsPerDay,
      startDate: type === ScheduleType.PERIOD ? parseDate(dto.startDate) : null,
      endDate: type === ScheduleType.PERIOD ? parseDate(dto.endDate) : null,
    };
  }

  private async ensurePeriodDoesNotOverlap(
    branchId: string,
    type: ScheduleType,
    startDate: Date | null,
    endDate: Date | null,
    excludeId?: string,
  ) {
    if (type !== ScheduleType.PERIOD || !startDate || !endDate) {
      return;
    }

    const overlapping = await this.prisma.scheduleVersion.findFirst({
      where: {
        branchId,
        type: ScheduleType.PERIOD,
        id: excludeId ? { not: excludeId } : undefined,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Нельзя создать несколько расписаний на одни и те же даты',
      );
    }
  }

  private async ensureBranchBelongsToOrg(
    branchId: string,
    organizationId: string,
  ) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { organizationId: true },
    });
    if (!branch || branch.organizationId !== organizationId) {
      throw new BadRequestException(
        'Филиал не принадлежит указанной организации',
      );
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.scheduleVersion.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Расписание не найдено');
    }
  }
}
