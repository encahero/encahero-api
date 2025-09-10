import { Injectable } from '@nestjs/common';
import { MagicLinkAuthDto } from './dto/magic-link-auth.dto';

import { TokenService } from './token.service';
import { UsersService } from 'src/users/users.service';

import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { CacheService } from 'src/redis/redis.service';

type GGPayLoad = {
  email: string,
  given_name: string,
  family_name: string,
  picture: string,
  sub: string,
}

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

  async sendLoginMagicLink(dto: MagicLinkAuthDto) {
    console.log("debug here dto", dto);
    const {email} =  dto ;
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


  async ggLogin(token: string) { 

    try {

      const ticket = await this.authClient.verifyIdToken({
      idToken: token,
      audience: this.configService.get<string>('GG_CLIENT_ID'),
    });

    const payload = ticket.getPayload() as GGPayLoad;

    console.log(payload)
    if (!payload) {
      return {
        status: 'Unauthorized',
        statusCode: 401,
        message: 'Invalid token',
      };
    }

    let user = await this.userService.findByEmail(payload.email);
    if (!user) {
      return {
        status: 'Not Found',
        statusCode: 404,
        message: 'User not registered',
      };
    }

    const jwt = await this.tokenService.generateAccessToken(JSON.stringify(user.id));
      const refresh = await this.tokenService.generateRefreshToken(JSON.stringify(user.id));
      
      console.log({ jwt, refresh })
      
      console.log( "Expire : ", this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE'))

    // save token to redis
    await this.cacheService.setRedis(`${user.id}:access-token`, jwt, Number(this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE'))); 
    await this.cacheService.setRedis(`${user.id}:refresh-token`, refresh, Number(this.configService.get('REDIS_REFRESH_TOKEN_EXPIRE'))); 

      return {
        status: 'Success',
        statusCode: 200,
        data: {
          accessToken: jwt,
          refreshToken: refresh,
          user,
      }
    };

    }catch (error) {
      console.log(error)
      return {
        status: 'Error',
        statusCode: 500,
        message: 'Internal server error',
      };
    }
    

  }

  async ggRegister(token: string) { 
    try {

      const ticket = await this.authClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GG_CLIENT_ID'),
      });
  
      const payload = ticket.getPayload() as GGPayLoad;
  
      if (!payload) {
        return {
          status: 'Unauthorized',
          statusCode: 401,
          message: 'Invalid token',
        };
      }
  
      let user = await this.userService.findByEmail(payload.email);
      if (user) {
        return {
          status: 'User Exists',
          statusCode: 404,
          message: 'User already registered',
        };
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
    await this.cacheService.setRedis(`${user.id}:access-token`, jwt, this.configService.get('REDIS_ACCESS_TOKEN_EXPIRE')); // 15 minutes
    await this.cacheService.setRedis(`${user.id}:refresh-token`, refresh, this.configService.get('REDIS_REFRESH_TOKEN_EXPIRE')); // 7 days
      
      return {
        status: 'Success',
        statusCode: 200,
        data: {
          accessToken: jwt,
          refreshToken: refresh,
          user,
      }
    };

    }catch (error) {
      console.log(error)
      return {
        status: 'Error',
        statusCode: 500,
        message: 'Internal server error',
      };
    }

  }


}
