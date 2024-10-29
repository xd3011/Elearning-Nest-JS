import { Role } from '@modules/role/entities/role.entity';
import { Module } from '@shared/constants/module.constant';
import { Column, ManyToMany, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description?: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ type: 'enum', enum: Module })
  module: Module;

  @ManyToMany(() => Role, (role) => role.permission)
  roles: Role[];
}
