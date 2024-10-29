import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { Connection, Repository } from 'typeorm';
import { GroupMember, Status } from '../entities/groupMember.entity';
import { IUser } from '@modules/user/interface/user.interface';
import { UserService } from '@modules/user/user.service';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    private userService: UserService,
    private connection: Connection,
  ) {}

  generateLinkJoin() {
    let linkJoin = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      linkJoin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return linkJoin;
  }
  async create(createGroupDto: CreateGroupDto, user: IUser) {
    const { id: userId } = user;
    // Get user
    const getUser = await this.userService.findUserById(userId);
    if (!getUser) {
      throw new CBadRequestException(
        UserService.name,
        'User not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User not found',
      );
    }
    // Create Group and GroupMember
    try {
      return await this.connection.transaction(async (manager) => {
        const group = await manager.save(Group, {
          ...createGroupDto,
          linkJoin: this.generateLinkJoin(),
        });

        const member = await manager.save(GroupMember, {
          group: group,
          user: getUser,
          role: 1,
          status: Status.ACTIVE,
        });

        return {
          group,
          member,
        };
      });
    } catch (error) {
      throw new Error(`Error creating group: ${error.message}`);
    }
  }

  async findAll(user: IUser, offset = 1, limit = 10, startId?: number) {
    try {
      const skip = (offset - 1) * limit;
      const take = limit;

      const query = this.groupRepository
        .createQueryBuilder('group')
        .innerJoinAndSelect('group.members', 'groupMember')
        .innerJoinAndSelect('groupMember.user', 'user')
        .select(['group', 'groupMember'])
        .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
        .where('user.id = :userId', { userId: user.id });

      if (startId) {
        query.andWhere('group.id >= :startId', { startId });
      }

      const [groups, total] = await query
        .skip(skip)
        .take(take)
        .getManyAndCount();

      return {
        total,
        page: offset,
        pageSize: limit,
        data: groups,
      };
    } catch (error) {
      throw new CBadRequestException(
        GroupService.name,
        'Error finding groups',
        ApiResponseCode.GROUP_NOT_FOUND,
        error.message,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} team`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }
}
