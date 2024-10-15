import { User } from '@modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.id)
  userId: number;

  @Column('text', { array: true })
  public paragraphs: string[];

  @Column()
  otp: string;

  @Column()
  expiredOtp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
