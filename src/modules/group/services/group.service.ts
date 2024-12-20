import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { DataSource, Repository } from 'typeorm';
import { GroupMember, Status } from '../entities/groupMember.entity';
import { IUser } from '@modules/user/interface/user.interface';
import { UserService } from '@modules/user/user.service';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { generateCodeJoin } from '@shared/generate-code-join';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  async create(createGroupDto: CreateGroupDto, user: IUser) {
    const { id: userId } = user;
    try {
      let codeJoin = generateCodeJoin();
      while (1) {
        const group = await this.groupRepository.findOne({
          where: { codeJoin },
        });
        if (!group) {
          break;
        }
        codeJoin = generateCodeJoin();
      }
      return await this.dataSource.transaction(async (manager) => {
        const group = await manager.save(Group, {
          ...createGroupDto,
          codeJoin: codeJoin,
        });
        const member = await manager.save(GroupMember, {
          group: group,
          user: { id: userId },
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

  async findOne(id: number, user: IUser) {
    const query = this.groupRepository
      .createQueryBuilder('group')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'user')
      .select(['group', 'groupMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('group.id = :groupId', { groupId: id });

    const group = await query.getOne();
    if (!group) {
      throw new CBadRequestException(
        GroupService.name,
        'Group not found',
        ApiResponseCode.GROUP_NOT_FOUND,
        'Group not found',
      );
    }

    const isMember = group.members.some((member) => member.user.id === user.id);
    if (!isMember) {
      throw new CBadRequestException(
        GroupService.name,
        'User is not a member of the group',
        ApiResponseCode.USER_NOT_A_MEMBER_IN_GROUP,
        'User is not a member of the group',
      );
    }
    return group;
  }

  async findOneByCodeJoin(codeJoin: string) {
    const group = await this.groupRepository.findOne({
      where: { codeJoin },
      relations: ['members', 'members.user'],
      select: {
        id: true,
        name: true,
        members: {
          id: true,
          user: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!group) {
      throw new CBadRequestException(
        GroupService.name,
        'Group not found',
        ApiResponseCode.GROUP_CODE_JOIN_NOT_FOUND,
        'Group with the provided codeJoin not found',
      );
    }
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    return await this.groupRepository.update(
      { id },
      {
        ...updateGroupDto,
      },
    );
  }

  async remove(id: number, user: IUser) {
    const userDelete = await this.userService.findUserById(user.id);
    if (!userDelete) {
      throw new CBadRequestException(
        UserService.name,
        'User delete not found',
        ApiResponseCode.USER_NOT_FOUND,
        'User delete not found',
      );
    }
    return await this.groupRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: userDelete,
    });
  }
}
