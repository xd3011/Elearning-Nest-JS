import { TypeMessage } from '@shared/constants/message-type.constant';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateSubPostDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNumber()
  @IsNotEmpty()
  postId: number;

  @IsEnum(TypeMessage)
  @IsNotEmpty()
  type: TypeMessage;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(o.type))
  fileName?: string;

  @IsNumber()
  @IsOptional()
  reply?: number;
}
