import { RecurrenceType } from '@shared/constants/schedule-metting.constant';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  startTime: Date;

  @IsBoolean()
  @IsNotEmpty()
  recurrence: boolean;

  @IsEnum(RecurrenceType)
  @IsOptional()
  @ValidateIf((o) => o.recurrence === true)
  type?: RecurrenceType;

  @IsDateString()
  @IsNotEmpty()
  @ValidateIf((o) => o.recurrence === true)
  @Transform(({ value }) => new Date(value))
  endTime: Date;
}
