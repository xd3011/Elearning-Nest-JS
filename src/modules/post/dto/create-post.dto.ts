import { TypeMessage } from '@shared/constants/message-type.constant';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @IsEnum(TypeMessage)
  @IsNotEmpty()
  type: TypeMessage;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(o.type))
  fileName?: string;
}
