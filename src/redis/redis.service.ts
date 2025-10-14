// cache.service.ts

import type { RedisClientType } from '@keyv/redis';
import { Injectable, Inject } from '@nestjs/common';
import Keyv from 'keyv';

@Injectable()
export class CacheService {
    private readonly keyvNamespace: string;
    constructor(
        @Inject('REDIS_CACHE') private readonly redisCache: Keyv,
        @Inject('MEMORY_CACHE') private readonly memoryCache: Keyv,
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    ) {
        this.keyvNamespace = this.redisCache.opts?.namespace || 'keyv';
    }

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

    async deleteByPattern(pattern: string): Promise<number> {
        let cursor = '0';
        let deletedCount = 0;

        const finalPattern = `${this.keyvNamespace}::${this.keyvNamespace}:${pattern}`;
        do {
            const result = await this.redisClient.scan(cursor, {
                MATCH: finalPattern,
                COUNT: 100,
            });

            cursor = result.cursor.toString();
            const keys = result.keys;

            if (keys.length > 0) {
                await this.redisClient.del(keys);
                deletedCount += keys.length;
            }
        } while (cursor !== '0');

        return deletedCount;
    }

    async revokeAllUserTokens(userId: string): Promise<number> {
        const pattern = `${userId}-*`;
        return this.deleteByPattern(pattern);
    }
}
