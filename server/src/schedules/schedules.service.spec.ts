import { BadRequestException } from '@nestjs/common';
import { DayOfWeek, ScheduleType, WeekScheduleType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulesService } from './schedules.service';

type MockedPrisma = Pick<PrismaService, 'branch' | 'scheduleVersion'>;

describe('SchedulesService', () => {
  let service: SchedulesService;
  let prisma: MockedPrisma;

  beforeEach(() => {
    prisma = {
      branch: {
        findUnique: jest.fn().mockResolvedValue({ organizationId: 'org-1' }),
      },
      scheduleVersion: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    } as unknown as MockedPrisma;
    service = new SchedulesService(prisma as PrismaService);
  });

  it('should throw when creating period schedule without dates', async () => {
    await expect(
      service.create({
        organizationId: 'org-1',
        branchId: 'branch-1',
        name: 'Расписание',
        type: ScheduleType.PERIOD,
        weekType: WeekScheduleType.ONE_WEEK,
        daysOfWeek: [DayOfWeek.MONDAY],
        lessonsPerDay: 6,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
