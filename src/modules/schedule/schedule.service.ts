import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { GroupService } from '@modules/group/services/group.service';
import { IUser } from '@modules/user/interface/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { DataSource, Repository } from 'typeorm';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
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

    if (!createScheduleDto.recurrence) {
      return await this.scheduleRepository.save({
        title: createScheduleDto.title,
        message: createScheduleDto.message,
        startTime,
        user: { id: user.id, email: user.email },
        group: { id: createScheduleDto.groupId },
      });
    } else {
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

      return await this.dataSource.transaction(async (manager) => {
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
    }
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
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
    });
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
    if (updateScheduleDto.startTime < new Date()) {
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
        startTime: updateScheduleDto.startTime,
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
    return await this.scheduleRepository.update(id, {
      message: updateScheduleDto.message,
      title: updateScheduleDto.title,
      startTime: updateScheduleDto.startTime,
    });
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
