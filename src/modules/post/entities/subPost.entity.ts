import { User } from '@modules/user/entities/user.entity';
import { TypeMessage } from '@shared/constants/message-type.constant';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class SubPost {
  @PrimaryColumn()
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

  @ManyToOne(() => SubPost, { nullable: true })
  @JoinColumn({ name: 'reply' })
  reply?: SubPost;
}
