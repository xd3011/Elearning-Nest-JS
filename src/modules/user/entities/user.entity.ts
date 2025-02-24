import { Role } from '@modules/role/entities/role.entity';
import { State } from '@shared/constants/user-state.constant';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

enum Action {
  CREATE = 0,
  UPDATE = 1,
  DELETE = 2,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ nullable: true })
  gender?: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role' })
  role: Role;

  @Column({ nullable: true })
  image?: string;

  @Column({
    type: 'enum',
    enum: State,
    default: State.OFFLINE,
  })
  state: State;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deletedBy' })
  deletedBy?: User;
}

@Entity()
export class UserAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: Action })
  action: Action;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user' })
  user: User;

  @Column()
  createdAt: Date;
}
