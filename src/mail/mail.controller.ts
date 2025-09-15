import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { MagicLinkAuthDto } from 'src/mail/dto/magic-link-auth.dto';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post('login-magic-link')
    sendLoginMagicLink(@Body() dto: MagicLinkAuthDto) {
        return this.mailService.sendLoginMagicLink(dto);
    }

    @Post('register-magic-link')
    sendRegisterMagicLink(@Body() dto: MagicLinkAuthDto) {
        return this.mailService.sendRegisterMagicLink(dto);
    }
}
