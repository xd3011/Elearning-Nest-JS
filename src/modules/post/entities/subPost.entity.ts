import { User } from '@modules/user/entities/user.entity';
import { TypeMessage } from '@shared/constants/message-type.constant';
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
import { Post } from './post.entity';

@Entity()
export class SubPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Post, { nullable: false })
  post: Post;

  @Column({
    type: 'enum',
    enum: TypeMessage,
  })
  type: TypeMessage;

  @Column({ nullable: true })
  fileName?: string;

  @ManyToOne(() => SubPost, { nullable: true })
  @JoinColumn({ name: 'reply' })
  reply?: SubPost;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
