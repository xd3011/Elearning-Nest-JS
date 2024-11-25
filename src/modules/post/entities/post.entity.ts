import { Group } from '@modules/group/entities/group.entity';
import { User } from '@modules/user/entities/user.entity';
import { TypeMessage } from '@shared/constants/message-type.constant';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  message: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Group, { nullable: false })
  group: Group;

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
