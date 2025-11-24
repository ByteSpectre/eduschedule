import { DayOfWeek, ScheduleType, WeekScheduleType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  organizationId: string;

  @IsString()
  branchId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @IsEnum(WeekScheduleType)
  weekType: WeekScheduleType;

  @IsOptional()
  @IsEnum(DayOfWeek)
  weekStartDay?: DayOfWeek;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek: DayOfWeek[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(18)
  lessonsPerDay: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
