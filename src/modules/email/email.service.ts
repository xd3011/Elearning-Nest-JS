import { Schedule } from '@modules/schedule/entities/schedule.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEmailConfig } from '@src/config/email.config';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
export class EmailService {
  private nodemailerTransport: Mail;
  constructor(private readonly configService: ConfigService) {
    // Initialization code here
    this.nodemailerTransport = createTransport({
      service: this.configService.getOrThrow<TEmailConfig>('email').emailHost,
      auth: {
        user: this.configService.getOrThrow<TEmailConfig>('email')
          .emailAuthUser,
        pass: this.configService.getOrThrow<TEmailConfig>('email')
          .emailAuthPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      secure: false,
    });
  }

  async handleSendScheduleToEmail(schedule: Schedule) {
    // Logic to send schedule to email
    schedule.group.members.forEach(async (member) => {
      const options: Mail.Options = {
        from: 'Admin',
        to: member.user.email,
        subject: 'Bạn có lịch họp',
        text: `Bạn có lịch họp tại nhóm: ${schedule.group.name}`,
      };
      await this.sendEmail(options);
    });
  }

  async sendEmail(options: Mail.Options): Promise<void> {
    return this.nodemailerTransport.sendMail(options);
  }
}
