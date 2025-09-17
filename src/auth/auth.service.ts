import {
    BadRequestException,
    ConflictException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { TokenService } from '../shared/utils/token/token.service';
import { UsersService } from 'src/users/users.service';

import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { CacheService } from 'src/redis/redis.service';
import { successResponse } from 'src/common/response';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { ERROR_MESSAGES, MAGIC_LINK, SUCCESS_MESSAGES } from 'src/constants';
import { getAccessTokenKey, getRefreshTokenKey } from 'src/shared/utils/func/redis-key';
import { EPRequestdto } from './dto/ep-request.dto';
import bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
type GGPayLoad = {
    email: string;
    given_name: string;
    family_name: string;
    picture: string;
    sub: string;
};

@Injectable()
export class AuthService {
    private readonly appName: string = `${process.env.APP_NAME}`;
    private authClient: OAuth2Client;
    constructor(
        private readonly tokenService: TokenService,
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
    ) {
        this.authClient = new OAuth2Client({
            clientId: this.configService.get<string>('GG_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GG_CLIENT_SECRET'),
        });
    }

    async login(loginDto: EPRequestdto) {
        // check DB if email exist
        const { email, password, deviceId } = loginDto;
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
        }

        // check password
        if (!user.password) {
            throw new BadRequestException(ERROR_MESSAGES.AUTH.INVALID_PASSWORD);
        }

        const isPasswordValid: boolean = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException(ERROR_MESSAGES.AUTH.INVALID_PASSWORD);
        }

        // generate token
        const { accessToken, refreshToken } = await this.generateAndSaveTokens(JSON.stringify(user.id), deviceId);

        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser,
        });
    }

    async register(registerDto: EPRequestdto) {
        const { email, password, deviceId } = registerDto;

        // check if user already exists
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS);
        }

        // create user
        const newUser = await this.userService.create({
            email,
            password,
        });

        // generate token
        const { accessToken, refreshToken } = await this.generateAndSaveTokens(JSON.stringify(newUser.id), deviceId);

        // convert to safe DTO
        const safeUser = plainToInstance(UserResponseDto, newUser, { excludeExtraneousValues: true });

        return successResponse(HttpStatus.CREATED, SUCCESS_MESSAGES.AUTH.REGISTER, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser,
        });
    }

    magicLink(token: string) {
        // Redirect về app với JWT
        return `<html>
                <body>
                    <meta http-equiv="refresh" content="0;url=encahero://login?jwt=${token}">
                    <p>If nothing happens, click <a href="encahero://login?jwt=${token}">GO TO APP</a></p>
                </body>
                </html>`;
    }

    async magicAuth(token: string, deviceId: string) {
        // parse token
        console.log(token);
        const result = await this.tokenService.validateMagicToken(token);

        if (!result) {
            throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
        }

        const { email, isRegister } = result;
        console.log({ email, isRegister });
        let user: User | null = null;

        if (isRegister) {
            const existingUser = await this.userService.findByEmail(email);
            if (existingUser) {
                throw new ConflictException(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS);
            }

            // create user
            user = await this.userService.create({
                email,
            });
        } else {
            console.log('here');
            user = await this.userService.findByEmail(email);
            if (!user) {
                throw new NotFoundException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
            }
        }

        const { accessToken, refreshToken } = await this.generateAndSaveTokens(JSON.stringify(user.id), deviceId);
        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        // remove redis token
        await this.cacheService.delRedis(`${user.email}:${MAGIC_LINK}`);

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser,
        });
    }

    async ggLogin(token: string, deviceId: string) {
        // parse token
        const ticket = await this.authClient.verifyIdToken({
            idToken: token,
        });

        const payload = ticket.getPayload() as GGPayLoad;

        if (!payload) {
            throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
        }

        const user = await this.userService.findByEmail(payload.email);
        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
        }

        const { accessToken, refreshToken } = await this.generateAndSaveTokens(JSON.stringify(user.id), deviceId);

        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser,
        });
    }

    async ggRegister(token: string, deviceId: string) {
        const ticket = await this.authClient.verifyIdToken({
            idToken: token,
        });

        const payload = ticket.getPayload() as GGPayLoad;

        if (!payload) {
            throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_TOKEN);
        }

        let user = await this.userService.findByEmail(payload.email);
        if (user) {
            throw new ConflictException(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS);
        }

        // create user
        user = await this.userService.create({
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            avatar: payload.picture,
        });
        const { accessToken, refreshToken } = await this.generateAndSaveTokens(JSON.stringify(user.id), deviceId);

        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REGISTER, {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: safeUser,
        });
    }

    async refreshToken(token: string) {
        try {
            // verify token
            const result = await this.tokenService.validateRefreshToken(token);
            if (!result) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_INVALID_TOKEN);
            }

            const { userId, deviceId } = result;

            // check in redis
            const redisToken = await this.cacheService.getRedis<string>(getRefreshTokenKey(userId, deviceId));
            if (redisToken !== token) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_INVALID_TOKEN);
            }

            // generate new access token
            const newAccessToken = await this.tokenService.generateAccessToken(userId, deviceId);
            // update redis
            await this.cacheService.setRedis(
                getAccessTokenKey(userId, deviceId),
                newAccessToken,
                this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE'),
            ); // 15 minutes

            return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REFRESH_TOKEN, { accessToken: newAccessToken });
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            const message = error instanceof Error ? error.message : 'Cannot refresh token';
            throw new InternalServerErrorException(message);
        }
    }

    async logout(token: string | undefined) {
        if (!token) {
            return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGOUT, true);
        }

        // remove all token from redis
        const result = await this.tokenService.validateAccessToken(token);
        if (!result) {
            return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGOUT, true);
        }

        const { userId, deviceId } = result;
        if (userId && deviceId) {
            await Promise.all([
                this.cacheService.delRedis(getAccessTokenKey(userId, deviceId)),
                this.cacheService.delRedis(getRefreshTokenKey(userId, deviceId)),
            ]);
        }

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGOUT, true);
    }

    private async generateAndSaveTokens(userId: string, deviceId: string) {
        try {
            const accessToken = await this.tokenService.generateAccessToken(userId, deviceId);
            const refreshToken = await this.tokenService.generateRefreshToken(userId, deviceId);

            await Promise.all([
                this.cacheService.setRedis(
                    getAccessTokenKey(userId, deviceId),
                    accessToken,
                    Number(this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE')),
                ),
                this.cacheService.setRedis(
                    getRefreshTokenKey(userId, deviceId),
                    refreshToken,
                    Number(this.configService.get('REDIS_REFRESH_TOKEN_EXPIRE')),
                ),
            ]);

            return { accessToken, refreshToken };
        } catch (error) {
            throw new InternalServerErrorException(error || 'generateAndSaveTokens() error');
        }
    }
}
