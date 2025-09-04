import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MagicLinkAuthDto } from './dto/magic-link-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-login-link')
  magicLoginLink(@Body() email: MagicLinkAuthDto) {
    return this.authService.sendLoginMagicLink(email);
  }


    @Post('magic-register-link')
  magicRegisterLink(@Body() email: MagicLinkAuthDto) {
    return this.authService.registerWithMagicLink(email);
  }

}
