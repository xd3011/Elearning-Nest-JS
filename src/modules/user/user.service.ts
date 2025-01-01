import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  CreateUserResult,
  RegisterUserDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { RoleService } from '@modules/role/role.service';
import { IUser } from './interface/user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private roleService: RoleService,
  ) {}

  private async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  isValidPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }

  async findOneByUsername(email: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .select(['user', 'role.id', 'role.name', 'role.description'])
      .getOne();

    if (!user) {
      throw new CBadRequestException(
        UserService.name,
        'User not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User not found',
      );
    }
    return user;
  }

  async register(registerUserDto: RegisterUserDto) {
    const isExist = await this.usersRepository.findOneBy({
      email: registerUserDto.email,
    });
    if (isExist) {
      throw new CBadRequestException(
        UserService.name,
        'User already exists',
        ApiResponseCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }
    const password = await this.hashPassword(registerUserDto.password);
    const role = await this.roleService.findOneByName('User');
    const newUser = await this.usersRepository.save({
      ...registerUserDto,
      password,
      role: { id: role.id },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    delete newUser.password;
    return {
      id: newUser?.id,
      createdAt: newUser?.createdAt,
    };
  }

  async create(
    createUserDto: CreateUserDto,
    createdByUserId: number,
  ): Promise<CreateUserResult> {
    const isExist = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new CBadRequestException(
        UserService.name,
        'User already exists',
        ApiResponseCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }
    const password = await this.hashPassword(createUserDto.password);
    const createdByUser = await this.usersRepository.findOneBy({
      id: createdByUserId,
    });
    if (!createdByUser) {
      throw new CBadRequestException(
        UserService.name,
        'Creator user not found',
        ApiResponseCode.USER_NOT_FOUND,
        'Creator user not found',
      );
    }
    await this.roleService.findOne(createUserDto.role);
    const newUser = await this.usersRepository.save({
      ...createUserDto,
      password,
      role: { id: createUserDto.role },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdByUser, // Set createdBy field
    });
    delete newUser.password;
    return {
      ...newUser,
      createdBy: { id: createdByUser.id, email: createdByUser.email },
    };
  }

  async findAllUser(offset = 1, limit = 10, startId?: number) {
    const where: FindManyOptions<User>['where'] = startId
      ? { id: MoreThanOrEqual(startId) }
      : {};
    const [users, count] = await this.usersRepository.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (offset - 1) * limit,
      take: limit,
      relations: ['createdBy'],
      select: {
        createdBy: { id: true, email: true },
      },
    });

    // Remove password field from response
    const results: User[] = users.map((user) => {
      delete user.password;
      return user;
    });

    if (results.length === 0) {
      throw new CBadRequestException(
        UserService.name,
        'No user found',
        ApiResponseCode.USER_NOT_FOUND,
        'No user found',
      );
    }

    const total = startId ? await this.usersRepository.count() : count;

    return {
      total,
      page: offset,
      pageSize: limit,
      data: results,
    };
  }

  async findUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new CBadRequestException(
        UserService.name,
        'User not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User not found',
      );
    }
    delete user.password;
    return user;
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    createdByUserId: number,
  ) {
    const getUserUpdate = await this.usersRepository.findOneBy({
      id: createdByUserId,
    });
    if (!getUserUpdate) {
      throw new CBadRequestException(
        'string',
        'User update not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User update not found',
      );
    }
    await this.roleService.findOne(updateUserDto.role);
    const userUpdate = await this.usersRepository.update(
      { id },
      {
        ...updateUserDto,
        role: { id: updateUserDto.role },
        updatedBy: getUserUpdate,
        updatedAt: new Date(),
      },
    );
    if (userUpdate.affected === 0) {
      throw new CBadRequestException(
        UserService.name,
        'User not found or no changes made',
        ApiResponseCode.USER_NOT_FOUND,
        'User not found or no changes made',
      );
    }
    return userUpdate;
  }

  async removeUser(id: number, userAcion: number) {
    const userDelete = await this.usersRepository.findOneBy({ id: userAcion });
    const user = await this.usersRepository.findOneBy({
      id,
    });
    if (!user) {
      throw new CBadRequestException(
        UserService.name,
        'User does not exist or has been deleted',
        ApiResponseCode.USER_NOT_FOUND,
        'User does not exist or has been deleted',
      );
    }
    return await this.usersRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userDelete,
    });
  }

  async changePassword(user: IUser, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;
    const getUser = await this.findOneByUsername(user.email);
    if (!getUser) {
      throw new CBadRequestException(
        UserService.name,
        'User not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User not found',
      );
    }
    if (!this.isValidPassword(oldPassword, getUser.password)) {
      throw new CBadRequestException(
        UserService.name,
        'Old password is incorrect',
        ApiResponseCode.PASSWORD_INCORRECT,
        'Old password is incorrect',
      );
    }
    const password = await this.hashPassword(newPassword);
    return await this.usersRepository.update(user.id, {
      password,
      updatedAt: new Date(),
    });
  }

  async resetPassword(id: number, newPassword: string) {
    await this.findUserById(id);
    const password = await this.hashPassword(newPassword);
    return await this.usersRepository.update(id, {
      password,
      updatedAt: new Date(),
    });
  }
}
