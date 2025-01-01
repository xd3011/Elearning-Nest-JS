import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GroupService } from '@modules/group/services/group.service';
import { IUser } from '@modules/user/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { DataSource, Repository } from 'typeorm';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { EmailService } from '@modules/email/email.service';
import { PostService } from '@modules/post/services/post.service';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async create(createScheduleDto: CreateScheduleDto, user: IUser) {
    await this.groupService.findOne(createScheduleDto.groupId, user);
    const startTime = new Date(createScheduleDto.startTime);

    if (startTime < new Date()) {
      throw new CBadRequestException(
        ScheduleService.name,
        'Cannot create a schedule that has passed',
        ApiResponseCode.SCHEDULE_INVALID_TIME,
        'Cannot create a schedule that has passed',
      );
    }

    const createSingleSchedule = async () => {
      const newSchedule = await this.scheduleRepository.save({
        title: createScheduleDto.title,
        message: createScheduleDto.message,
        startTime,
        user: { id: user.id, email: user.email },
        group: { id: createScheduleDto.groupId },
      });
      const schedule = await this.findOne(newSchedule.id, user);
      this.checkTimeCreateNotificationForSchedule(startTime, schedule);
      return newSchedule;
    };

    const createRecurringSchedules = async () => {
      const endTime = new Date(createScheduleDto.endTime);
      if (endTime < startTime) {
        throw new CBadRequestException(
          ScheduleService.name,
          'End time must be greater than start time',
          ApiResponseCode.SCHEDULE_INVALID_TIME,
          'End time must be greater than start time',
        );
      }

      const recurrenceIntervals = {
        1: (date: Date) => date.setDate(date.getDate() + 1),
        2: (date: Date) => date.setDate(date.getDate() + 7),
        3: (date: Date) => date.setMonth(date.getMonth() + 1),
        4: (date: Date) => date.setFullYear(date.getFullYear() + 1),
      };

      const intervalFunction = recurrenceIntervals[createScheduleDto.type];
      if (!intervalFunction) {
        throw new CBadRequestException(
          ScheduleService.name,
          'Invalid recurrence type',
          ApiResponseCode.SCHEDULE_NOT_RECURRENCE_TYPE,
          'Invalid recurrence type',
        );
      }

      const schedules = await this.dataSource.transaction(async (manager) => {
        const schedules: Schedule[] = [];
        let currentTime = new Date(createScheduleDto.startTime);

        while (endTime >= currentTime) {
          const savedSchedule = await manager.save(Schedule, {
            title: createScheduleDto.title,
            message: createScheduleDto.message,
            startTime: new Date(currentTime),
            user: { id: user.id, email: user.email },
            group: { id: createScheduleDto.groupId },
          });
          schedules.push(savedSchedule);
          intervalFunction(currentTime);
        }
        return schedules;
      });

      const schedule = await this.findOne(schedules[0].id, user);

      this.checkTimeCreateNotificationForSchedule(startTime, schedule);

      return schedules;
    };

    return createScheduleDto.recurrence
      ? createRecurringSchedules()
      : createSingleSchedule();
  }

  async getAllSchedulesForUser(user: IUser) {
    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.group', 'group')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'memberUser')
      .select([
        'schedule',
        'group.id',
        'group.name',
        'groupMember',
        'memberUser.id',
        'memberUser.email',
        'memberUser.firstName',
        'memberUser.lastName',
      ])
      .where('schedule.startTime >= :currentTime', {
        currentTime: new Date(),
      })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();
    const schedulesForUser = schedules
      .filter((schedule) =>
        schedule.group.members.some((member) => member.user.id === user.id),
      )
      .map((schedule) => {
        delete schedule.group.members;
        return schedule;
      });
    if (schedulesForUser.length <= 0) {
      throw new CBadRequestException(
        ScheduleService.name,
        'Schedule not found',
        ApiResponseCode.SCHEDULE_NOT_FOUND,
        'Schedule not found',
      );
    }
    return {
      total: schedulesForUser.length,
      data: schedulesForUser,
    };
  }

  async findAllSchedule() {
    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);

    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.group', 'group')
      .innerJoinAndSelect('schedule.user', 'user')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'memberUser')
      .select([
        'schedule',
        'group.id',
        'group.name',
        'groupMember',
        'memberUser.id',
        'memberUser.email',
        'memberUser.firstName',
        'memberUser.lastName',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .where('schedule.startTime > :currentTime', { currentTime })
      .andWhere('schedule.startTime <= :oneHourLater', { oneHourLater })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules;
  }

  async findAllScheduleAfterOneHour() {
    const currentTime = new Date();
    const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const twoHoursLater = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);

    const schedules = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.group', 'group')
      .innerJoinAndSelect('schedule.user', 'user')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'memberUser')
      .select([
        'schedule',
        'group.id',
        'group.name',
        'groupMember',
        'memberUser.id',
        'memberUser.email',
        'memberUser.firstName',
        'memberUser.lastName',
      ])
      .where('schedule.startTime > :oneHourLater', { oneHourLater })
      .andWhere('schedule.startTime <= :twoHoursLater', { twoHoursLater })
      .orderBy('schedule.startTime', 'ASC')
      .getMany();

    return schedules;
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
    await this.groupService.findOne(groupId, user);

    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.user', 'user')
      .innerJoinAndSelect('schedule.group', 'group')
      .select(['schedule'])
      .addSelect(['group.id', 'group.name'])
      .where('group.id = :groupId', { groupId })
      .andWhere('schedule.startTime >= :currentTime', {
        currentTime: new Date(),
      });
    if (startId) {
      query.andWhere('schedule.id < :startId', { startId });
    }
    let [schedules, total] = await query
      .skip(skip)
      .take(take)
      .orderBy('schedule.startTime', 'ASC')
      .getManyAndCount();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: schedules,
    };
  }

  async findOne(id: number, user: IUser) {
    const schedule = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.group', 'group')
      .innerJoinAndSelect('group.members', 'groupMember')
      .innerJoinAndSelect('groupMember.user', 'memberUser')
      .innerJoinAndSelect('schedule.user', 'user')
      .select(['schedule'])
      .addSelect([
        'group.id',
        'group.name',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'groupMember',
        'memberUser.id',
        'memberUser.email',
        'memberUser.firstName',
        'memberUser.lastName',
      ])
      .where('schedule.id = :id', { id })
      .getOne();
    if (!schedule) {
      throw new CBadRequestException(
        ScheduleService.name,
        'Schedule not found',
        ApiResponseCode.SCHEDULE_NOT_FOUND,
        'Schedule not found',
      );
    }
    await this.groupService.findOne(schedule.group.id, user);
    return schedule;
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto, user: IUser) {
    const schedule = await this.findOne(id, user);
    if (schedule.user.id !== user.id) {
      throw new CBadRequestException(
        ScheduleService.name,
        'You do not have permission to update this schedule',
        ApiResponseCode.SCHEDULE_NOT_PERMISSION,
        'You do not have permission to update this schedule',
      );
    }
    const startTime = new Date(updateScheduleDto.startTime);
    if (startTime < new Date()) {
      throw new CBadRequestException(
        ScheduleService.name,
        'Cannot update a schedule that has passed',
        ApiResponseCode.SCHEDULE_INVALID_TIME,
        'Cannot update a schedule that has passed',
      );
    }
    const newSchedule = await this.scheduleRepository.findOne({
      where: {
        group: { id: schedule.group.id },
        startTime: startTime,
      },
    });
    if (newSchedule) {
      throw new CBadRequestException(
        ScheduleService.name,
        'Cannot update a schedule that has the same time with another schedule',
        ApiResponseCode.SCHEDULE_DUPLICATE_TIME,
        'Cannot update a schedule that has the same time with another schedule',
      );
    }
    await this.scheduleRepository.update(id, {
      message: updateScheduleDto.message,
      title: updateScheduleDto.title,
      startTime: startTime,
    });

    const updatedSchedule = await this.findOne(id, user);
    this.checkTimeCreateNotificationForSchedule(startTime, updatedSchedule);
    return updatedSchedule;
  }

  async checkTimeCreateNotificationForSchedule(
    startTime: Date,
    schedule: Schedule,
  ) {
    const now = new Date();
    const timeCheckHour = new Date(
      Math.floor(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000) +
        1 * 60 * 60 * 1000,
    );

    const timeCheckTwoHour = new Date(
      Math.floor(now.getTime() / (60 * 60 * 1000)) * (60 * 60 * 1000) +
        2 * 60 * 60 * 1000,
    );

    if (startTime < timeCheckHour) {
      await this.postService.createMeeting(schedule);
    }
    if (startTime < timeCheckTwoHour) {
      await this.emailService.handleSendScheduleToEmail(schedule);
    }
  }

  async remove(id: number, user: IUser) {
    const schedule = await this.findOne(id, user);
    if (schedule.user.id !== user.id) {
      throw new CBadRequestException(
        ScheduleService.name,
        'You do not have permission to remove this schedule',
        ApiResponseCode.SCHEDULE_NOT_PERMISSION,
        'You do not have permission to remove this schedule',
      );
    }
    return await this.scheduleRepository.delete(id);
  }
}
