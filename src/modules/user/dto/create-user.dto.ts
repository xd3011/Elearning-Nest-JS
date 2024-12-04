import { Role } from '@modules/role/entities/role.entity';

enum State {
  OFFLINE = 0,
  ONLINE = 1,
  CALLING = 2,
  BUSY = 3,
  INVISIBLE = 4,
  PENDING = 5,
}

export class RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export class CreateUserDto extends RegisterUserDto {
  role: number;
}

export class CreateUserResult {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  role: Role;
  image?: string;
  state: State;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy: {
    id: number;
    email: string;
  };
}
