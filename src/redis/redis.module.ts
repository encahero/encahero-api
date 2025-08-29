import { Global, Module } from '@nestjs/common';
import Keyv from 'keyv';
import KeyvRedis, { createClient } from '@keyv/redis';
import { CacheService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CACHE',
      useFactory: async () => {
        const redis = createClient({ url: 'redis://redis:6379' });
        const keyvRedis = new KeyvRedis(redis);
        const redisCache = new Keyv({ store: keyvRedis });
        try {
          await redisCache.set('ping', 'pong');
          const value = await redisCache.get<string>('ping');
          console.log('Ping value:', value);
          console.log('✅ Redis Cache Ready');
        } catch (err) {
          console.error('❌ Redis Cache Error:', err);
        }
        return redisCache;
      },
    },
    {
      provide: 'MEMORY_CACHE',
      useFactory: async () => {
        const memoryCache = new Keyv({ ttl: 60000 });
        await memoryCache.set('ping', 'pong');
        const a = await memoryCache.get<string>('ping');
        console.log('Ping value:', a);
        console.log('✅ Memory Cache Ready');
        return memoryCache;
      },
    },
    CacheService,
  ],
  exports: ['REDIS_CACHE', 'MEMORY_CACHE', CacheService],
})
export class CacheRedisModule {}
