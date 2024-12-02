import { TypeMessage } from '@shared/constants/message-type.constant';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
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

  @IsNumber()
  @IsOptional()
  reply?: number;
}
