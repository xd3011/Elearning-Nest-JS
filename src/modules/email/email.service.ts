import { Schedule } from '@modules/schedule/entities/schedule.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async handleSendScheduleToEmail(schedule: Schedule) {
    schedule.group.members.forEach(async (member) => {
      const hours = schedule.startTime.getHours();
      const minutes = schedule.startTime.getMinutes();
      const seconds = schedule.startTime.getSeconds();
      const date = schedule.startTime.getDate();
      const month = schedule.startTime.getMonth() + 1;
      const year = schedule.startTime.getFullYear();

      const time = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`;
      const formattedDate = `${date}/${month}/${year}`;

      await this.mailerService.sendMail({
        to: member.user.email,
        from: 'Support Team <spteamdh@gmail.com>',
        subject: 'Thông Báo Cuộc Họp',
        template: 'schedule',
        context: {
          recipientName: `${member.user.firstName} ${member.user.lastName}`,
          groupName: schedule.group.name,
          date: formattedDate,
          time: time,
          senderName: 'Support Team <spteamdh@gmail.com>',
        },
      });
    });
  }
}
