import { OrganizationType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterOrganizationDto {
  @IsString()
  organizationName: string;

  @IsString()
  city: string;

  @IsEnum(OrganizationType, {
    message: 'organizationType must be one of UNIVERSITY, COLLEGE или SCHOOL',
  })
  @Transform(({ value }): OrganizationType | undefined => {
    if (value === undefined || value === null) {
      return value;
    }
    return String(value).toUpperCase().trim() as OrganizationType;
  })
  organizationType: OrganizationType;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  branchName?: string;
}
