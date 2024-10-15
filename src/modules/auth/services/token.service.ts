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
    const token = await this.tokenRepository.findOne({
      where: { userId },
    });
    if (!token) {
      await this.tokenRepository.save({
        refreshTokens: [refreshToken],
        userId,
        createdAt: new Date(),
      });
    } else {
      token.refreshTokens.push(refreshToken);
      await this.tokenRepository.save(token);
    }
  }

  async findTokenByUserId(userId: number) {
    return await this.tokenRepository.find({
      where: { userId },
    });
  }

  async deleteToken(refreshToken: string, userId: number) {
    const token = await this.tokenRepository.findOne({
      where: { userId },
    });
    if (token.refreshTokens.length === 1) {
      return await this.tokenRepository.delete({ userId });
    }
    token.refreshTokens = token.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    return await this.tokenRepository.save(token);
  }
}
