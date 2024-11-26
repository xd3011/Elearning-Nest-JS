import { Role } from '@modules/role/entities/role.entity';
import { Method, Module } from '@shared/constants/module.constant';
import {
  Column,
  ManyToMany,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: Method })
  method: Method;

  @Column()
  path: string;

  @Column({ type: 'enum', enum: Module })
  module: Module;

  @ManyToMany(() => Role, (role) => role.permission)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
