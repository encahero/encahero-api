import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MagicLinkAuthDto } from 'src/mail/dto/magic-link-auth.dto';
import { ERROR_MESSAGES, MAGIC_LINK, RESET_PASSWORD_OTP } from 'src/constants';
import { TokenService } from 'src/shared/utils/token/token.service';
import { UsersService } from 'src/users/users.service';
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
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
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

        return true;
    }

    async sendRegisterMagicLink(dto: MagicLinkAuthDto) {
        // generate token
        const { email } = dto;

        const user = await this.userService.findByEmail(email);

        if (user) {
            throw new ConflictException(ERROR_MESSAGES.USER.ALREADY_EXISTS);
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

        return true;
    }

    async sendResetPasswordOTP(dto: MagicLinkAuthDto) {
        const { email } = dto;

        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new ConflictException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        // random 6 numbers
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await this.cacheService.setRedis(`${email}:${RESET_PASSWORD_OTP}`, otp, 60000 * 5);

        const html = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #4CAF50;">Your OTP Code</h2>
                    <p>We received a request to reset your password.</p>
                    <p>Use the OTP below to continue:</p>
                    <div style="font-size: 24px; font-weight: bold; padding: 10px 20px; background: #f4f4f4; display: inline-block; border-radius: 5px;">
                    ${otp}
                    </div>
                    <p>This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
                    <hr/>
                    <p style="font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
                </div>
        `;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Your OTP For Reset Password',
            html,
        });

        return true;
    }
}
