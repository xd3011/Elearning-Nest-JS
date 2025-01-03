import { User } from '@modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Index()
  @Column('text', { nullable: true })
  refreshToken?: string;

  @Column({ nullable: true })
  expiredToken?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
