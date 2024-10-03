import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

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

  async create(createUserDto: CreateUserDto, createdByUserId: number) {
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
    return this.usersRepository.save({
      ...createUserDto,
      password,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      createdBy: createdByUser, // Set createdBy field
    });
  }

  async findAll(offset?: number, limit?: number, startId?: number) {
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

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
