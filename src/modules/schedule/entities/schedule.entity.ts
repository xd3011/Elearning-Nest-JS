import { Group } from '@modules/group/entities/group.entity';
import { User } from '@modules/user/entities/user.entity';
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
export class Schedule {
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

  @Column()
  startTime: Date;

  // @Column()
  // recurrence: boolean;

  // @Column({ type: 'enum', enum: RecurrenceType, nullable: true })
  // @ValidateIf((o) => o.recurrence === true)
  // @IsOptional()
  // @IsEnum(RecurrenceType)
  // recurrenceType?: RecurrenceType;

  // @Column({ nullable: true })
  // @ValidateIf((o) => o.recurrence === true)
  // @IsOptional()
  // endTime?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
