import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EPRequestdto } from './dto/ep-request.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    login(@Body() loginDto: EPRequestdto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() @Body() registerDto: EPRequestdto) {
        return this.authService.register(registerDto);
    }

    @Get('magic-link')
    getToken(@Query('token') token: string) {
        console.log({ token });
        return this.authService.magicLink(token);
    }

    @Post('magic-link')
    magicLoginLink(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        console.log('post ');
        return this.authService.magicAuth(token, deviceId);
    }

    @Post('google-login')
    ggLogin(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        return this.authService.ggLogin(token, deviceId);
    }

    @Post('google-register')
    ggRegister(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        return this.authService.ggRegister(token, deviceId);
    }

    @Post('refresh-token')
    refreshToken(@Body('token') token: string) {
        return this.authService.refreshToken(token);
    }

    @Post('logout')
    logout(@Body('token') token: string) {
        return this.authService.logout(token);
    }
}
