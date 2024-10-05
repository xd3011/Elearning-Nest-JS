import { Injectable } from '@nestjs/common';
import { CreateUserDto, UserCreateResult } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { error } from 'console';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  async register(createUserDto: CreateUserDto) {
    const isExist = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new CBadRequestException(
        'string',
        'User already exists',
        ApiResponseCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }
    const password = await this.hashPassword(createUserDto.password);
    const newUser = await this.usersRepository.save({
      ...createUserDto,
      password,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    });
    return newUser;
  }

  async create(
    createUserDto: CreateUserDto,
    createdByUserId: number,
  ): Promise<UserCreateResult> {
    const isExist = await this.usersRepository.findOneBy({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new CBadRequestException(
        'string',
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
        'string',
        'Creator user not found',
        ApiResponseCode.USER_NOT_FOUND,
        'Creator user not found',
      );
    }
    const newUser = await this.usersRepository.save({
      ...createUserDto,
      password,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      createdBy: createdByUser, // Set createdBy field
    });
    return {
      ...newUser,
      createdBy: { id: createdByUser.id, email: createdByUser.email },
    };
  }

  async findAllUser(offset?: number, limit?: number, startId?: number) {
    const where: FindManyOptions<User>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThanOrEqual(startId);
      separateCount = await this.usersRepository.count();
    }
    const [items, count] = await this.usersRepository.findAndCount({
      where,
      order: {
        id: 'ASC',
      },
      skip: (offset - 1) * limit,
      take: limit,
      relations: ['createdBy'],
      select: {
        password: false,
        createdBy: {
          id: true,
          email: true,
        },
      },
    });

    return {
      data: items,
      total: startId ? separateCount : count,
      page: offset,
      pageSize: limit,
    };
  }

  async findUserById(id: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });
      delete user.password;
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    createdByUserId: number,
  ) {
    try {
      const createdByUser = await this.usersRepository.findOneBy({
        id: createdByUserId,
      });
      const userUpdate = this.usersRepository.update(
        { id: id },
        {
          ...updateUserDto,
          updatedBy: createdByUser,
        },
      );
      return userUpdate;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeUser(id: number) {
    const user = await this.usersRepository.findOneBy({
      id,
      isDeleted: false,
    });
    if (!user) {
      throw new CBadRequestException(
        'string',
        'User already exists',
        ApiResponseCode.USER_ALREADY_EXISTS,
        'User already exists',
      );
    }
    return await this.usersRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }
}
