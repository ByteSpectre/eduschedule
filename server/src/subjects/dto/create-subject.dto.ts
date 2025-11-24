import { Transform } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MinLength(2)
  name: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  hours: number;
}

