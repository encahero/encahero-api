import Keyv from 'keyv';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeyvRedis, { createClient } from '@keyv/redis';
import { CacheService } from './redis.service';
import { CustomConfigModule } from 'src/config/custom-config.module';
import { MEMORY_CACHE_TTL } from 'src/constants';

@Global()
@Module({
  imports: [CustomConfigModule],
  providers: [
    {
      provide: 'REDIS_CACHE',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redis = createClient({ url: redisUrl });
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
        const memoryCache = new Keyv({ ttl: MEMORY_CACHE_TTL });
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
