import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ERROR_MESSAGES } from 'src/constants';
import { CacheService } from 'src/redis/redis.service';
import { getAccessTokenKey, getRefreshTokenKey } from '../func/redis-key';

type JwtPayload = {
    userId: string;
    deviceId: string;
};

type JwtMagicPayload = {
    email: string;
};

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
    ) {}

    async generateAccessToken(userId: string, deviceId: string): Promise<string> {
        return await this.jwtService.signAsync(
            { userId, deviceId },
            {
                expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE'),
                secret: this.configService.get('SECRET_KEY'),
            },
        );
    }

    async generateRefreshToken(userId: string, deviceId: string): Promise<string> {
        return await this.jwtService.signAsync(
            { userId, deviceId },
            {
                expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE'),
                secret: this.configService.get('REFRESH_KEY'),
            },
        );
    }

    async generateMagicToken(email: string): Promise<string> {
        return await this.jwtService.signAsync(
            { email },
            { expiresIn: '5m', secret: this.configService.get('MAGIC_KEY') },
        );
    }

    async validateAccessToken(token: string): Promise<{ userId: string; deviceId: string } | null> {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: this.configService.get('SECRET_KEY'),
            });

            const userId = payload.userId;
            const deviceId = payload.deviceId;

            const redisToken = await this.cacheService.getRedis<string>(getAccessTokenKey(userId, deviceId));
            if (redisToken !== token) {
                return null;
            }
            return { userId, deviceId };
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCESS_TOKEN_EXPIRED);
            }

            return null;
        }
    }

    async validateRefreshToken(token: string): Promise<{ userId: string; deviceId: string } | null> {
        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
                secret: this.configService.get('REFRESH_KEY'),
            });

            const userId = payload.userId;
            const deviceId = payload.deviceId;

            const redisToken = await this.cacheService.getRedis<string>(getRefreshTokenKey(userId, deviceId));
            if (redisToken !== token) {
                return null;
            }

            return { userId, deviceId };
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_EXPIRED);
            }

            return null;
        }
    }

    async validateMagicToken(token: string): Promise<string | null> {
        try {
            const payload = await this.jwtService.verifyAsync<JwtMagicPayload>(token, {
                secret: this.configService.get('MAGIC_KEY'),
            });

            return payload.email;
        } catch {
            return null;
        }
    }
}
