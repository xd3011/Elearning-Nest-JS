import { Module, Method } from '@shared/constants/module.constant';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  method: Method;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsNotEmpty()
  module: Module;
}
