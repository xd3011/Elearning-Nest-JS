import { User } from '@modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true })
  expiredOtp?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
