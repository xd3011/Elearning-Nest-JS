import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../entities/opt.entity';
import { User } from '@modules/user/entities/user.entity';
import { CBadRequestException } from '@shared/custom-http-exception';
import { TokenService } from './token.service';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
  ) {}

  async createOtp(user: User, otp: string) {
    const expiredOtp = new Date(Date.now() + 5 * 60000);
    const lastOtp = await this.otpRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (lastOtp) {
      return await this.otpRepository.update(lastOtp.id, { otp, expiredOtp });
    }
    return await this.otpRepository.save({ user, otp, expiredOtp });
  }

  async findOtpByEmail(email: string) {
    const otp = await this.otpRepository
      .createQueryBuilder('otp')
      .leftJoinAndSelect('otp.user', 'user')
      .select(['otp.id', 'otp.otp', 'otp.expiredOtp'])
      .addSelect(['user.id', 'user.email'])
      .where('user.email = :email', { email })
      .getOne();
    if (!otp) {
      throw new CBadRequestException(
        TokenService.name,
        'OTP not found',
        ApiResponseCode.OTP_NOT_FOUND,
      );
    }
    return otp;
  }

  async deleteOtpByEmail(email: string) {
    const otp = await this.findOtpByEmail(email);
    return await this.deleteOtp(otp.id);
  }

  async deleteOtp(otpId: number) {
    return await this.otpRepository.delete(otpId);
  }
}
