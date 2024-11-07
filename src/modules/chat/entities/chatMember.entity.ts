import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity()
export class ChatMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Chat, { nullable: false })
  chat: Chat;

  @CreateDateColumn()
  createdAt: Date;
}
