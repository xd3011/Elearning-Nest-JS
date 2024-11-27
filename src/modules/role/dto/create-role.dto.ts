import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @Transform(({ value }) => value.map(Number))
  @Type(() => Number)
  permissions: number[];
}
