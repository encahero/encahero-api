import {
    BadRequestException,
    ConflictException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { MagicLinkAuthDto } from './dto/magic-link-auth.dto';

import { TokenService } from '../shared/utils/token/token.service';
import { UsersService } from 'src/users/users.service';

import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { CacheService } from 'src/redis/redis.service';
import { successResponse } from 'src/common/response';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

import { ERROR_MESSAGES, SUCCESS_MESSAGES, ACCESS_TOKEN, REFRESH_TOKEN } from 'src/constants';

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
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
        private readonly cacheService: CacheService,
    ) {
        this.authClient = new OAuth2Client({
            clientId: this.configService.get<string>('GG_CLIENT_ID'),
            clientSecret: this.configService.get<string>('GG_CLIENT_SECRET'),
        });
    }

    async magicLogin(token: string) {
        // Redirect về app với JWT
        return `<html>
    <body>
      <script>
        // Redirect tới app bằng custom scheme
        window.location = "encahero://auth/login?jwt=${token}";
      </script>
      <p>If nothing happens, click <a href="encahero://auth/login?jwt=${token}"> encahero://auth/login?jwt=${token} here</a></p>
    </body>
  </html>`;
    }

    sendLoginMagicLink(dto: MagicLinkAuthDto) {
        console.log('Hello');
        throw new BadRequestException();
        // if user exists

        // let user  = await this.userService.findByEmail(email);
        // if (!user) {
        //   // response error
        //   return {
        //     status: 'Not Found',
        //     statusCode: 404,
        //     message: 'User not found',
        //   };
        // }

        // // generate a token
        // const token = await this.tokenService.generateAccessToken(JSON.stringify(user.id));

        // // generate deep link
        // const magicLink = `http://encahero.com:3000/api/v1/auth?token=${token}`;

        // console.log("debug here")
        // // send mail
        // await this.mailService.sendMagicLink(email, magicLink);
        // return {
        //   data: 'Check your email for the magic link',
        // }
    }

    async registerWithMagicLink(dto: MagicLinkAuthDto) {
        const { email } = dto;
        // if user exists

        const user = await this.userService.findByEmail(email);
        if (user) {
            // response error
            return {
                status: 'Conflict',
                statusCode: 409,
                message: 'User already exists ',
            };
        }

        // generate a token
        const token = await this.tokenService.generateAccessToken(email);

        // generate deep link
        const magicLink = `${this.appName}/auth/magic-link?token=${token}`;

        // send mail
        await this.mailService.sendMagicLink(email, magicLink);
        return 'This action adds a new auth';
    }

    async ggLogin(token: string) {
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

        const jwt = await this.tokenService.generateAccessToken(JSON.stringify(user.id));
        const refresh = await this.tokenService.generateRefreshToken(JSON.stringify(user.id));

        // save token to redis
        await this.cacheService.setRedis(
            `${user.id}:${ACCESS_TOKEN}`,
            jwt,
            Number(this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE')),
        );
        await this.cacheService.setRedis(
            `${user.id}:${REFRESH_TOKEN}`,
            refresh,
            Number(this.configService.get('REDIS_REFRESH_TOKEN_EXPIRE')),
        );

        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        console.log({ safeUser });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, {
            accessToken: jwt,
            refreshToken: refresh,
            user: safeUser,
        });
    }

    async ggRegister(token: string) {
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

        const jwt = await this.tokenService.generateAccessToken(JSON.stringify(user.id));
        const refresh = await this.tokenService.generateRefreshToken(JSON.stringify(user.id));

        // save token to redis
        await this.cacheService.setRedis(
            `${user.id}:${ACCESS_TOKEN}`,
            jwt,
            this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE'),
        ); // 15 minutes
        await this.cacheService.setRedis(
            `${user.id}:${REFRESH_TOKEN}`,
            refresh,
            this.configService.get('REDIS_REFRESH_TOKEN_EXPIRE'),
        ); // 7 days

        const safeUser = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REGISTER, {
            accessToken: jwt,
            refreshToken: refresh,
            user: safeUser,
        });
    }

    async refreshToken(token: string) {
        try {
            // verify token
            const userId = await this.tokenService.validateRefreshToken(token);
            if (!userId) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_INVALID_TOKEN);
            }

            // check in redis
            const redisToken = await this.cacheService.getRedis<string>(`${userId}:${REFRESH_TOKEN}`);
            if (redisToken !== token) {
                throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_INVALID_TOKEN);
            }

            // generate new access token
            const newAccessToken = await this.tokenService.generateAccessToken(userId);
            // update redis
            await this.cacheService.setRedis(
                `${userId}:${ACCESS_TOKEN}`,
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
        const userId = await this.tokenService.validateAccessToken(token);
        console.log({ userId });
        if (userId) {
            await Promise.all([
                this.cacheService.delRedis(`${userId}:${ACCESS_TOKEN}`),
                this.cacheService.delRedis(`${userId}:${REFRESH_TOKEN}`),
            ]);
        }

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGOUT, true);
    }
}
