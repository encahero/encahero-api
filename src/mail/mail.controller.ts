import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { MagicLinkAuthDto } from 'src/mail/dto/magic-link-auth.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post('login-magic-link')
    async sendLoginMagicLink(@Body() dto: MagicLinkAuthDto) {
        const data = await this.mailService.sendLoginMagicLink(dto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.MAIL.SEND_LOGIN_MAGIC_LINK, data);
    }

    @Post('register-magic-link')
    async sendRegisterMagicLink(@Body() dto: MagicLinkAuthDto) {
        const data = await this.mailService.sendRegisterMagicLink(dto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.MAIL.SEND_REGISTER_MAGIC_LINK, data);
    }

    @Post('reset-password-otp')
    async sendResetPasswordOTP(@Body() dto: MagicLinkAuthDto) {
        const data = await this.mailService.sendResetPasswordOTP(dto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.MAIL.SEND_RESET_PASSWORD_OTP, data);
    }
}
