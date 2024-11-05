import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class WSService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
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
    console.log(cacheData);
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
    console.log(cacheData);
  }
}
