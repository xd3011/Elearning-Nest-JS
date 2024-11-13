import { IsNumber, IsString } from 'class-validator';

export class CreateChatMessageDto {
  @IsString()
  message: string;

  @IsNumber()
  chatId: number;

  @IsNumber()
  replyMessage?: number;
}
