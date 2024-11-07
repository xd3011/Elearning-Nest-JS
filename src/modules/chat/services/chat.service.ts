import { Injectable } from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';
import { UserService } from '@modules/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { ChatMember } from '../entities/chatMember.entity';
import { IUser } from '@modules/user/interface/user.interface';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

@Injectable()
export class ChatService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createChatDto: CreateChatDto, user: IUser) {
    const member = await this.userService.findUserById(createChatDto.memberId);
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.members', 'chatMember')
      .innerJoinAndSelect('chatMember.user', 'user')
      .select(['chat', 'chatMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('chatMember.chatId')
          .from(ChatMember, 'chatMember')
          .where('chatMember.userId = :userId', { userId: user.id })
          .orWhere('chatMember.userId = :memberId', {
            memberId: createChatDto.memberId,
          })
          .groupBy('chatMember.chatId')
          .having('COUNT(DISTINCT chatMember.userId) = 2')
          .getQuery();
        return 'chat.id IN ' + subQuery;
      });

    const chat = await query.getOne();
    if (chat) {
      throw new CBadRequestException(
        ChatService.name,
        'Chat already exists',
        ApiResponseCode.CHAT_ALREADY_EXISTS,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      const chat = await manager.save(Chat, new Chat());

      const chatMember1 = await manager.save(ChatMember, {
        chat: { id: chat.id },
        user: { id: user.id },
      });

      const chatMember2 = await manager.save(ChatMember, {
        chat: { id: chat.id },
        user: { id: member.id },
      });

      return {
        chat,
        members: [chatMember1, chatMember2],
      };
    });
  }

  async findAll(user: IUser) {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.members', 'chatMember')
      .innerJoinAndSelect('chatMember.user', 'user')
      .select(['chat', 'chatMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('chatMember.chatId')
          .from(ChatMember, 'chatMember')
          .where('chatMember.userId = :userId', { userId: user.id })
          .getQuery();
        return 'chat.id IN ' + subQuery;
      });

    const chats = await query.getMany();
    if (chats.length === 0) {
      throw new CBadRequestException(
        ChatService.name,
        'No chats found',
        ApiResponseCode.CHAT_NOT_FOUND,
      );
    }
    return {
      data: chats,
    };
  }

  async findOne(id: number, user: IUser) {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoinAndSelect('chat.members', 'chatMember')
      .innerJoinAndSelect('chatMember.user', 'user')
      .select(['chat', 'chatMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('chat.id = :id', { id });
    const chat = await query.getOne();
    if (!chat) {
      throw new CBadRequestException(
        ChatService.name,
        'Chat not found',
        ApiResponseCode.CHAT_NOT_FOUND,
      );
    }
    if (!chat.members.some((member) => member.user.id === user.id)) {
      throw new CBadRequestException(
        ChatService.name,
        'User not a member of the chat',
        ApiResponseCode.USER_NOT_A_MEMBER_IN_CHAT,
      );
    }
    return chat;
  }

  update(id: number, updateChatDto: UpdateChatDto, user: IUser) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
