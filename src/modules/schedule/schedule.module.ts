import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupModule } from '@modules/group/group.module';
import { Schedule } from './entities/schedule.entity';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule]), GroupModule, EmailModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
