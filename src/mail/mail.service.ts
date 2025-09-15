import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MagicLinkAuthDto } from 'src/mail/dto/magic-link-auth.dto';
import { ERROR_MESSAGES, MAGIC_LINK, SUCCESS_MESSAGES } from 'src/constants';
import { TokenService } from 'src/shared/utils/token/token.service';
import { UsersService } from 'src/users/users.service';
import { successResponse } from 'src/common/response';
import { CacheService } from 'src/redis/redis.service';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UsersService,
        private readonly tokenService: TokenService,
        private readonly cacheService: CacheService,
    ) {}

    async sendLoginMagicLink(dto: MagicLinkAuthDto) {
        // generate token
        const { email } = dto;
        console.log({ email });

        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
        }

        // generate a token
        const token = await this.tokenService.generateMagicToken(email);

        await this.cacheService.setRedis(`${email}:${MAGIC_LINK}`, token, 60000 * 5);

        // // generate deep link
        const magicLink = `http://192.168.1.103:3000/api/v1/auth/magic-link?token=${token}`;

        const html = `
                    <p>Click the link below to login:</p>
                    <a href="${magicLink}" style="color: blue;">Click here</a>
                    <p>This link will expire in 5 minutes.</p>
        `;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Your Magic Link',
            html,
        });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.MAIL.SEND_LOGIN_MAGIC_LINK, true);
    }

    async sendRegisterMagicLink(dto: MagicLinkAuthDto) {
        // generate token
        const { email } = dto;

        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS);
        }

        // generate a token
        const token = await this.tokenService.generateMagicToken(email, true);

        await this.cacheService.setRedis(`${email}:${MAGIC_LINK}`, token, 60000 * 5);

        // // generate deep link
        const magicLink = `http://192.168.1.103:3000/api/v1/auth/magic-link?token=${token}`;

        const html = `
                    <p>Click the link below to register:</p>
                    <a href="${magicLink}" style="color: blue;">Click here</a>
                    <p>This link will expire in 5 minutes.</p>
        `;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Your Magic Link',
            html,
        });

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.MAIL.SEND_LOGIN_MAGIC_LINK, true);
    }
}
