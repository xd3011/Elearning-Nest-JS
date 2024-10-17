import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../entities/token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async saveToken(refreshToken: string, userId: number) {
    return await this.tokenRepository.save({
      user: { id: userId },
      refreshToken,
      createdAt: new Date(),
    });
  }

  async findToken(refreshToken: string): Promise<boolean> {
    const token = await this.tokenRepository.findOne({
      where: { refreshToken },
    });

    return !!token;
  }

  async deleteToken(refreshToken: string) {
    return await this.tokenRepository.delete({ refreshToken });
  }
}
