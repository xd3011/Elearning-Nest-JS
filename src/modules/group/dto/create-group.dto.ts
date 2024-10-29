import { IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
