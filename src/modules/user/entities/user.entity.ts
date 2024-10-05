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

enum State {
  OFFLINE = 0,
  ONLINE = 1,
  CALLING = 2,
  BUSY = 3,
  INVISIBLE = 4,
  PENDING = 5,
}

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

  @Column()
  role: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: State, default: State.OFFLINE })
  state: State;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn() // Add DeleteDateColumn
  deletedAt?: Date;

  @Column()
  isDeleted: boolean;

  // Relationships to other users responsible for actions
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

  // Relating this action to a user
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  createdAt: Date;
}
