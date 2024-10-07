enum State {
  OFFLINE = 0,
  ONLINE = 1,
  CALLING = 2,
  BUSY = 3,
  INVISIBLE = 4,
  PENDING = 5,
}

export class CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export class UserCreateResult {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  role: string;
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
