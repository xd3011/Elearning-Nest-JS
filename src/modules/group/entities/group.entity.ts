import { User } from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from './groupMember.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  codeJoin: string;

  @OneToMany(() => GroupMember, (groupMember) => groupMember.group)
  members: GroupMember[];

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
