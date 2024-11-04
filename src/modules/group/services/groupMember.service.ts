import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember, Status } from '../entities/groupMember.entity';
import { IUser } from '@modules/user/interface/user.interface';
import { GroupService } from './group.service';
import { UserService } from '@modules/user/user.service';
import { AddMemberDto } from '../dto/create-member-group.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    private readonly groupService: GroupService,
    private readonly userService: UserService,
  ) {}

  async findAll(groupId: number, offset = 1, limit = 10, startId?: number) {
    const query = this.groupMemberRepository
      .createQueryBuilder('groupMember')
      .leftJoinAndSelect('groupMember.user', 'user')
      .select(['groupMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('groupMember.groupId = :groupId', { groupId });
    if (startId) {
      query.andWhere('groupMember.id >= :startId', { startId });
    }
    const [groupMembers, total] = await query
      .skip((offset - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: groupMembers,
    };
  }

  async addMember(addMember: AddMemberDto, user: IUser) {
    // Get group by Id
    const group = await this.groupService.findOne(addMember.groupId, user);
    if (group.members.some((member) => member.user.id === addMember.memberId)) {
      throw new Error(
        `User with id ${addMember.memberId} is already a member of this group`,
      );
    }
    const newGroupMember = await this.groupMemberRepository.save({
      user: { id: addMember.memberId },
      group: { id: addMember.groupId },
      role: 2,
      status: Status.PENDING,
      createdBy: user,
    });

    // Send email to new member => click to link to join group
    return newGroupMember;
  }

  async updateMemberStatus(groupId: number, user: IUser) {
    const groupMember = await this.groupMemberRepository.findOne({
      where: { group: { id: groupId }, user: { id: user.id } },
    });
    if (!groupMember) {
      throw new Error(
        `Group member not found for group ${groupId} and user ${user.id}`,
      );
    }
    groupMember.status = Status.ACTIVE;
    await this.groupMemberRepository.save(groupMember);
    return groupMember;
  }

  async removeMember(groupId: number, memberId: number, user: IUser) {
    const groupMember = await this.groupMemberRepository.findOne({
      where: { group: { id: groupId }, user: { id: memberId } },
    });
    if (!groupMember) {
      throw new Error(
        `Group member not found for group ${groupId} and user ${memberId}`,
      );
    }
    // Check role user ............ => remove
    await this.groupMemberRepository.remove(groupMember);
    return groupMember;
  }

  async memberJoinGroup(groupId: number, codeJoin: string, user: IUser) {
    const group = await this.groupService.findOne(groupId, user);
    if (group.codeJoin !== codeJoin) {
      throw new Error('Code join is not correct');
    }
    if (group.members.some((member) => member.id === user.id)) {
      throw new Error('User is already a member of this group');
    }
    const newGroupMember = await this.groupMemberRepository.save({
      user: { id: user.id },
      group: { id: groupId },
      role: 2,
      status: Status.ACTIVE,
      createdBy: user,
    });
    return newGroupMember;
  }
}
