import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '@modules/user/entities/user.entity';
import { TypeMessage } from '@shared/constants/message-type.constant';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToOne(() => Chat, { nullable: true })
  @JoinColumn({ name: 'chat' })
  chat?: Chat;

  @Column()
  message: string;

  @ManyToOne(() => ChatMessage, { nullable: true })
  @JoinColumn({ name: 'replyMessage' })
  replyMessage?: ChatMessage;

  @Column({
    type: 'enum',
    enum: TypeMessage,
  })
  type: TypeMessage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
