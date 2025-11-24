import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  course: number;

  @IsString()
  @MinLength(2)
  faculty: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive()
  studentCount: number;
}

