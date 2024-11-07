import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ChatMember } from './chatMember.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ChatMember, (chatMember) => chatMember.chat)
  members: ChatMember[];
}
