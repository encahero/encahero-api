// cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CACHE') private readonly redisCache: Keyv,
    @Inject('MEMORY_CACHE') private readonly memoryCache: Keyv,
  ) {}

  // ================= Redis =================
  async setRedis(key: string, value: any, ttlInSeconds?: number) {
    await this.redisCache.set(key, value, ttlInSeconds);
  }

  async getRedis<T = any>(key: string): Promise<T | undefined> {
    return this.redisCache.get(key);
  }

  async delRedis(key: string) {
    await this.redisCache.delete(key);
  }

  // ================= Memory =================
  async setMemory(key: string, value: any, ttlInSeconds?: number) {
    await this.memoryCache.set(key, value, ttlInSeconds);
  }

  async getMemory<T = any>(key: string): Promise<T | undefined> {
    return this.memoryCache.get(key);
  }

  async delMemory(key: string) {
    await this.memoryCache.delete(key);
  }

  // ================= Helper =================
  async existsRedis<T = unknown>(key: string): Promise<boolean> {
    const value = await this.redisCache.get<T>(key);
    return value !== undefined;
  }

  async existsMemory<T = unknown>(key: string): Promise<boolean> {
    const value = await this.memoryCache.get<T>(key);
    return value !== undefined;
  }
}
