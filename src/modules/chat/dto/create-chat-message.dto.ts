import { TypeMessage } from '@shared/constants/message-type.constant';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  message: string;

  @IsNumber()
  chatId: number;

  @IsNumber()
  replyMessage?: number;

  @IsEnum(TypeMessage)
  @IsNotEmpty()
  type: TypeMessage;
}
