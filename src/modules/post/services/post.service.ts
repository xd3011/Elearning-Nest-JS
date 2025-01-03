import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupService } from '@modules/group/services/group.service';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { GroupMemberService } from '@modules/group/services/groupMember.service';
import { ScheduleService } from '@modules/schedule/schedule.service';
import { TypeMessage } from '@shared/constants/message-type.constant';
import { User } from '@modules/user/entities/user.entity';
import { WSService } from '@src/ws/ws.service';
import { CLogger } from '@src/logger/custom-loger';
import { EmailService } from '@modules/email/email.service';
import { Schedule } from '@modules/schedule/entities/schedule.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly groupService: GroupService,
    private readonly groupMemberService: GroupMemberService,
    private readonly scheduleService: ScheduleService,
    private readonly wsService: WSService,
    private readonly emailService: EmailService,
  ) {}
  async create(createPostDto: CreatePostDto, user: IUser | User) {
    // Check group exists and user is member
    await this.groupService.findOne(createPostDto.groupId, user);
    const post = await this.postRepository.save({
      ...createPostDto,
      user: { id: user.id, email: user.email },
      group: { id: createPostDto.groupId },
    });

    if (post.type === TypeMessage.MEETING) {
      this.scheduleMeetingCheck(post, user);
    }
    return post;
  }

  private async scheduleMeetingCheck(post: Post, user: IUser | User) {
    setTimeout(async () => {
      const userInMeeting = await this.wsService.getUsersInMetting(
        post.group.id,
      );
      if (!userInMeeting?.userIds.length) {
        const meeting = await this.findOne(post.id, user);
        const createdAt = new Date(meeting.createdAt).getTime();
        const updatedAt = new Date(meeting.updatedAt).getTime();
        if (Math.abs(updatedAt - createdAt) < 1000) {
          await this.postRepository.update(post.id, {
            updatedAt: new Date(),
          });
        }
      }
    }, 10 * 60 * 1000);
  }

  async findAll(
    groupId: number,
    user: IUser,
    offset = 1,
    limit = 10,
    startId?: number,
  ) {
    const skip = (offset - 1) * limit;
    const take = limit;
    // Check group exists and user is member
    await this.groupService.findOne(groupId, user);
    // Get posts in group
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user')
      .innerJoinAndSelect('post.group', 'group')
      .select([
        'post',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect(['group.id', 'group.name'])
      .where('group.id = :groupId', { groupId });
    if (startId) {
      query.andWhere('post.id < :startId', { startId });
    }
    let [posts, total] = await query
      .skip(skip)
      .take(take)
      .orderBy('post.createdAt', 'DESC')
      .getManyAndCount();

    posts.reverse();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: posts,
    };
  }

  async getAllMettingForUser(user: IUser) {
    const query = await this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.group', 'group')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'user')
      .select(['post', 'group.id', 'group.name', 'groupMember'])
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .where('post.type = :type', { type: 'MEETING' })
      .andWhere('post.createdAt < :currentTime', {
        currentTime: new Date(),
      })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
    const allMetting = query
      .filter((post) => {
        return post.group.members.some((member) => member.user.id === user.id);
      })
      .map((post) => {
        delete post.group.members;
        return post;
      });

    return {
      total: allMetting.length,
      data: allMetting,
    };
  }

  async findOne(id: number, user: IUser | User) {
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user')
      .innerJoinAndSelect('post.group', 'group')
      .select([
        'post',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect(['group.id', 'group.name'])
      .where('post.id = :id', { id });
    const post = await query.getOne();

    if (!post) {
      throw new CBadRequestException(
        PostService.name,
        'Post not found',
        ApiResponseCode.POST_NOT_FOUND,
        'Post not found',
      );
    }
    const userMember = await this.groupMemberService.findAll(post.group.id);
    const isMember = userMember.data.some(
      (member) => member.user.id === user.id,
    );

    if (!isMember) {
      throw new CBadRequestException(
        PostService.name,
        'Post not permission',
        ApiResponseCode.POST_NOT_PERMISSION,
        'You do not have permission to access this post',
      );
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return await this.postRepository.update(
      { id },
      {
        ...updatePostDto,
        group: { id: updatePostDto.groupId },
      },
    );
  }

  async updateTimeEndMetting(id: number) {
    await this.postRepository.update(
      { id },
      {
        updatedAt: new Date(),
      },
    );
    return await this.postRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    return await this.postRepository.update(id, {
      deletedAt: new Date(),
    });
  }

  async createMeeting(schedule: Schedule) {
    const currentTime = new Date().getTime();
    const startTime = new Date(schedule.startTime).getTime();
    const delay = startTime - currentTime;
    setTimeout(async () => {
      try {
        const post = await this.create(
          {
            title: schedule.title,
            message: schedule.message,
            type: TypeMessage.MEETING,
            groupId: schedule.group.id,
          },
          schedule.user,
        );
        await this.wsService.handleSendPost(post, schedule.group.id);
      } catch (error) {
        CLogger.log('Failed to create post:', error);
      }
    }, delay);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async createAllScheduleMeeting() {
    try {
      const schedules = await this.scheduleService.findAllSchedule();
      const currentTime = new Date().getTime();

      await Promise.all(
        schedules.map(async (schedule) => {
          const startTime = new Date(schedule.startTime).getTime();
          const delay = startTime - currentTime;

          return new Promise((resolve) => {
            setTimeout(async () => {
              try {
                const post = await this.create(
                  {
                    title: schedule.title,
                    message: schedule.message,
                    type: TypeMessage.MEETING,
                    groupId: schedule.group.id,
                  },
                  schedule.user,
                );
                await this.wsService.handleSendPost(post, schedule.group.id);
                resolve(true);
              } catch (error) {
                CLogger.log('Failed to create post:', error);
                resolve(false);
              }
            }, delay);
          });
        }),
      );
    } catch (error) {
      CLogger.log('Failed to create post:', error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendNotificationAllScheduleMeeting() {
    try {
      const schedules =
        await this.scheduleService.findAllScheduleAfterOneHour();
      schedules.forEach(async (schedule) => {
        await this.emailService.handleSendScheduleToEmail(schedule);
      });
    } catch (error) {
      CLogger.log('Failed to send notification:', error);
      throw error;
    }
  }
}
