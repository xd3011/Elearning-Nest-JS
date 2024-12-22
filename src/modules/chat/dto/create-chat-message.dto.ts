import { TypeMessage } from '@shared/constants/message-type.constant';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  message: string;

  @IsNumber()
  chatId: number;

  @IsNumber()
  replyMessage?: number;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(o.type))
  fileName?: string;

  @IsEnum(TypeMessage)
  @IsNotEmpty()
  type: TypeMessage;
}

export class LeaveCalling {
  @IsNumber()
  chatId: number;

  @IsNumber()
  chatMessageId: number;
}
