import { BranchType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  organizationId: string;

  @IsString()
  name: string;

  @IsEnum(BranchType)
  @Transform(({ value }): BranchType | undefined => {
    if (value === undefined || value === null) {
      return value;
    }
    return String(value).toUpperCase().trim() as BranchType;
  })
  type: BranchType;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
