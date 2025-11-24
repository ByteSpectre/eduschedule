import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { RoomType } from '@prisma/client';

export class CreateRoomDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  @MinLength(1)
  number: string;

  @IsString()
  @MinLength(1)
  building: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(RoomType)
  type: RoomType;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  capacity: number;
}

