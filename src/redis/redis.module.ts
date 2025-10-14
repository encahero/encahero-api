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
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');
                const redis = createClient({ url: redisUrl });

                redis.on('error', (err) => console.error('❌ Redis Client Error:', err));
                redis.on('connect', () => console.log('✅ Redis Client Connected'));

                await redis.connect();
                return redis;
            },
        },
        {
            provide: 'REDIS_CACHE',
            inject: [ConfigService, 'REDIS_CLIENT'],
            useFactory: async (configService: ConfigService, redisClient: any) => {
                const keyvRedis = new KeyvRedis(redisClient);
                const redisCache = new Keyv({
                    store: keyvRedis,
                    namespace: configService.get<string>('REDIS_NAMESPACE'),
                });

                try {
                    await redisCache.set('ping', 'pong');
                    const value = await redisCache.get<string>('ping');
                    console.log('✅ Redis Cache Ready - Ping:', value);
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
                const value = await memoryCache.get<string>('ping');
                console.log('✅ Memory Cache Ready - Ping:', value);
                return memoryCache;
            },
        },
        CacheService,
    ],
    exports: ['REDIS_CACHE', 'MEMORY_CACHE', 'REDIS_CLIENT', CacheService],
})
export class CacheRedisModule {}
