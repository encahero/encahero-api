import { Injectable } from '@nestjs/common';
import { MagicLinkAuthDto } from './dto/magic-link-auth.dto';

import { TokenService } from './token.service';
import { UsersService } from 'src/users/users.service';

import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AuthService {
  private readonly appName: string = `${process.env.APP_NAME}`;
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    private readonly mailService: MailService,
  ) { }
  async sendLoginMagicLink(dto: MagicLinkAuthDto) {
    const {email} =  dto ;
    // if user exists

    let user  = await this.userService.findByEmail(email);
    if (!user) {
      // response error
      return {
        status: 'Not Found',
        statusCode: 404,
        message: 'User not found',
      };
    }

  

    // generate a token
    const token = await this.tokenService.generateAccessToken(JSON.stringify(user.id));

    // generate deep link
    const magicLink = `exp://127.0.0.1:8081/--/login?token=${token}`;

    console.log("debug here")
    // send mail
    await this.mailService.sendMagicLink(email, magicLink);
    return {
      data: 'Check your email for the magic link',
    }
  }

  async registerWithMagicLink(dto: MagicLinkAuthDto) {

        const {email} =  dto ;
    // if user exists

    let user  = await this.userService.findByEmail(email);
    if (user) {
      // response error
      return {
        status: 'Conflict',
        statusCode: 409,
        message: 'User already exists ',
      };
    }

    

    // generate a token
    const token = this.tokenService.generateAccessToken(email);

    // generate deep link
    const magicLink = `${this.appName}/auth/magic-link?token=${token}`;

    // send mail
    await this.mailService.sendMagicLink(email, magicLink);
    return 'This action adds a new auth';


  }


}
