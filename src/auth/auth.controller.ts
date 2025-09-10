import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MagicLinkAuthDto } from './dto/magic-link-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/')
  getToken(@Query('token') token: string) {
    console.log({token});
    return this.authService.magicLogin(token);
  }
  @Post('magic-login-link')
  magicLoginLink(@Body() email: MagicLinkAuthDto) {
    return this.authService.sendLoginMagicLink(email);
  }


    @Post('magic-register-link')
  magicRegisterLink(@Body() email: MagicLinkAuthDto) {
    return this.authService.registerWithMagicLink(email);
    }

  @Post('google-login')
  ggLogin(@Body('token') token: string) {
    return this.authService.ggLogin(token);
  }

  @Post('google-register')
  ggRegister(@Body('token') token: string) {
    return this.authService.ggRegister(token);
  }


}
