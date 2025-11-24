import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  @MinLength(2)
  department: string;

  @IsOptional()
  @IsBoolean()
  noSaturday?: boolean;
}

