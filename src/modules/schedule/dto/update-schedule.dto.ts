import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateScheduleDto {
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
  startTime: Date;
}
