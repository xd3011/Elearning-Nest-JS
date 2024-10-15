import { User } from '@modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  userId: number;

  @Column('text', { array: true })
  refreshTokens?: string[];

  @Column()
  otp?: string;

  @Column()
  expiredOtp?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
