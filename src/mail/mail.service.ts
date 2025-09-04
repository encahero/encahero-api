import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMagicLink(to: string, link: string) {
        const html = `
        <p>Click the link below to login:</p>
        <a href="https://retrochat.xyz/search?filter=user" style="color: blue;">Click here</a>
        <p>This link will expire in 15 minutes.</p>
        `;

        console.log({to, link, html});

        await this.mailerService.sendMail({
            to,
            subject: 'Your Magic Link',
            html,
        });
    }
}
