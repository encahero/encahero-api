import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/shared/utils/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [MailModule, UsersModule, TokenModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
