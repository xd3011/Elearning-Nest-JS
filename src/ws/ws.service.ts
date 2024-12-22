import { Post } from '@modules/post/entities/post.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { WsGateway } from './ws.gateway';

@Injectable()
export class WSService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => WsGateway))
    private readonly wsGateway: WsGateway,
  ) {}
  async cacheClientId(clientId: string, userId: number) {
    const cacheKey = `/socketClientId/${userId}`;
    let cacheData = await this.cacheManager.get<{ clientIds: string[] }>(
      cacheKey,
    );
    if (!cacheData) {
      cacheData = { clientIds: [] };
    }
    if (cacheData.clientIds.includes(clientId)) {
      return;
    }
    cacheData.clientIds.push(clientId);
    await this.cacheManager.set(cacheKey, cacheData);
  }

  async removeClientId(clientId: string, userId: number) {
    const cacheKey = `/socketClientId/${userId}`;
    let cacheData = await this.cacheManager.get<{ clientIds: string[] }>(
      cacheKey,
    );
    if (!cacheData) {
      return;
    }
    cacheData.clientIds = cacheData.clientIds.filter((id) => id !== clientId);
    await this.cacheManager.set(cacheKey, cacheData);
  }

  async getClientIds(userId: number) {
    const cacheKey = `/socketClientId/${userId}`;
    let cacheData = await this.cacheManager.get<{ clientIds: string[] }>(
      cacheKey,
    );
    return cacheData;
  }

  async cacheUserInMetting(userId: number, groupId: number) {
    const cacheKey = `/meeting/${groupId}`;
    let cacheData = await this.cacheManager.get<{ userIds: number[] }>(
      cacheKey,
    );
    if (!cacheData) {
      cacheData = { userIds: [] };
    }
    if (cacheData.userIds.includes(userId)) {
      return;
    }
    cacheData.userIds.push(userId);
    await this.cacheManager.set(cacheKey, cacheData);
  }

  async removeUserInMetting(userId: number, groupId: number) {
    const cacheKey = `/meeting/${groupId}`;
    let cacheData = await this.cacheManager.get<{ userIds: number[] }>(
      cacheKey,
    );
    if (!cacheData) {
      return;
    }
    cacheData.userIds = cacheData.userIds.filter((id) => id !== userId);
    await this.cacheManager.set(cacheKey, cacheData);
  }

  async clearUserInMetting(groupId: number) {
    const cacheKey = `/meeting/${groupId}`;
    await this.cacheManager.del(cacheKey);
  }

  async getUsersInMetting(groupId: number) {
    const cacheKey = `/meeting/${groupId}`;
    let cacheData = await this.cacheManager.get<{ userIds: number[] }>(
      cacheKey,
    );
    return cacheData;
  }

  async handleSendPost(post: Post, groupId: number) {
    this.wsGateway.handleSendPost(post, groupId);
  }
}
