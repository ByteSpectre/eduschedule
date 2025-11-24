import { IsOptional, IsString } from 'class-validator';

export class DuplicateScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;
}
