import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  role: string;

  @Column()
  image: string;

  @Column()
  state: State;
}

enum State {
  OFFLINE = 0,
  ONLINE = 1,
  CALLING = 2,
  BUSY = 3,
  INVISIBLE = 4,
  PENDING = 5,
}
