import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  refreshToken: string[];

  @Column()
  otp: string;

  @Column()
  expiredOtp: Date;

  @Column()
  @CreateDateColumn()
  createdAt: Date;
}
