import { Group } from '@modules/group/entities/group.entity';
import { User } from '@modules/user/entities/user.entity';
import { TypeMessage } from '@shared/constants/message-type.constant';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Post {
  @PrimaryColumn()
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
}
