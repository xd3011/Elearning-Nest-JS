import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { User } from '@src/decorator/user.decorator';
import { IUser } from '@modules/user/interface/user.interface';
import { PaginationParams } from '@src/utils/types/paginationParams';
import { ApiTags } from '@nestjs/swagger';

@Controller('schedule')
@ApiTags('Schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @User() user: IUser) {
    return this.scheduleService.create(createScheduleDto, user);
  }

  @Get()
  findAll(
    @Query() { offset, limit, startId }: PaginationParams,
    @Query('groupId') groupId: number,
    @User() user: IUser,
  ) {
    return this.scheduleService.findAll(groupId, user, offset, limit, startId);
  }

  @Get('allSchedule')
  findAllSchedule(@User() user: IUser) {
    return this.scheduleService.getAllSchedulesForUser(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @User() user: IUser) {
    return this.scheduleService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @User() user: IUser,
  ) {
    return this.scheduleService.update(id, updateScheduleDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @User() user: IUser) {
    return this.scheduleService.remove(id, user);
  }
}
