import { Injectable } from '@nestjs/common';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { ChatService } from './chat.service';
import { IUser } from '@modules/user/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chatMessage.entity';
import { Repository } from 'typeorm';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { CBadRequestException } from '@shared/custom-http-exception';
import { UpdateChatMessageDto } from '../dto/update-chat-message.dto';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}
  async create(chatMessageDto: CreateChatMessageDto, user: IUser) {
    let chatMessage: ChatMessage | null;
    if (chatMessageDto?.replyMessage) {
      chatMessage = await this.chatMessageRepository.findOne({
        where: {
          chat: { id: chatMessageDto.chatId },
          id: chatMessageDto.replyMessage,
        },
      });
      if (!chatMessage) {
        throw new CBadRequestException(
          ChatMessageService.name,
          'Chat message not found',
          ApiResponseCode.CHAT_MESSAGE_NOT_FOUND,
        );
      }
    }
    return await this.chatMessageRepository.save({
      user: { id: user.id },
      chat: { id: chatMessageDto.chatId },
      message: chatMessageDto.message,
      replyMessage: chatMessageDto.replyMessage ? chatMessage : null,
    });
  }

  async findAll(
    chatId: number,
    user: IUser,
    offset = 1,
    limit = 20,
    startId?: number,
  ) {
    const skip = (offset - 1) * limit;
    const take = limit;

    const query = this.chatMessageRepository
      .createQueryBuilder('chatMessage')
      .leftJoinAndSelect('chatMessage.replyMessage', 'replyMessage')
      .innerJoinAndSelect('chatMessage.chat', 'chat')
      .innerJoinAndSelect('chatMessage.user', 'user')
      .select(['chatMessage', 'replyMessage.id', 'replyMessage.message'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('chatMessage.chat = :chatId', { chatId })
      .orderBy('chatMessage.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (startId) {
      query.andWhere('chatMessage.id >= :startId', { startId });
    }

    const [chatMessages, total] = await query.getManyAndCount();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: chatMessages,
    };
  }

  async findOne(id: number, user: IUser) {
    const query = this.chatMessageRepository
      .createQueryBuilder('chatMessage')
      .innerJoinAndSelect('chatMessage.replyMessage', 'replyMessage')
      .innerJoinAndSelect('chatMessage.chat', 'chat')
      .innerJoinAndSelect('chatMessage.user', 'user')
      .select(['chatMessage', 'replyMessage.id', 'replyMessage.message'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('chatMessage.id = :id', { id });
    const chatMessage = await query.getOne();
    if (!chatMessage) {
      throw new CBadRequestException(
        ChatMessageService.name,
        'Chat message not found',
        ApiResponseCode.CHAT_MESSAGE_NOT_FOUND,
      );
    }
    return chatMessage;
  }

  async updateMessage(
    id: number,
    updateChatMessage: UpdateChatMessageDto,
    user: IUser,
  ) {
    const chatMessage = await this.chatMessageRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
    });

    if (!chatMessage) {
      throw new CBadRequestException(
        ChatMessageService.name,
        'Cannot update a message from another user',
        ApiResponseCode.CHAT_MESSAGE_NOT_PERMISSION,
      );
    }

    return await this.chatMessageRepository.update(
      { id },
      { message: updateChatMessage.message },
    );
  }

  async deleteMessage(id: number, user: IUser) {
    const chatMessage = await this.chatMessageRepository.findOne({
      where: {
        id,
        user: { id: user.id },
      },
    });
    if (!chatMessage) {
      throw new CBadRequestException(
        ChatMessageService.name,
        'Cannot delete a message from another user',
        ApiResponseCode.CHAT_MESSAGE_NOT_PERMISSION,
      );
    }
    return await this.chatMessageRepository.update(id, {
      deletedAt: new Date(),
    });
  }
}
