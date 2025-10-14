import { Controller, Get, Post, Body, Query, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EPRequestdto } from './dto/ep-request.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: EPRequestdto) {
        const data = await this.authService.login(loginDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, data);
    }

    @Post('register')
    async register(@Body() @Body() registerDto: EPRequestdto) {
        const data = await this.authService.register(registerDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REGISTER, data);
    }

    // html to redirect
    @Get('magic-link')
    getToken(@Query('token') token: string) {
        return this.authService.magicLink(token);
    }

    @Post('magic-link')
    async magicLink(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        const data = await this.authService.magicAuth(token, deviceId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, data);
    }

    @Post('google-login')
    async ggLogin(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        const data = await this.authService.ggLogin(token, deviceId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGIN, data);
    }

    @Post('google-register')
    async ggRegister(@Body('token') token: string, @Body('deviceId') deviceId: string) {
        const data = await this.authService.ggRegister(token, deviceId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REGISTER, data);
    }

    @Post('refresh-token')
    async refreshToken(@Body('token') token: string) {
        const data = await this.authService.refreshToken(token);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.REFRESH_TOKEN, data);
    }

    @Post('reset-password')
    async resetPassword(@Body('password') password: string, @Body('token') token: string) {
        const data = await this.authService.resetPassword(password, token);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.RESET_PASSWORD, data);
    }

    @Post('verify-otp')
    async verifyOTP(@Body() dto: VerifyOtpDto) {
        const data = await this.authService.verifyOTP(dto.email, dto.otp);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.VERIFY_OTP, data);
    }

    @Post('logout')
    async logout(@Body('token') token: string) {
        const data = await this.authService.logout(token);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.AUTH.LOGOUT, data);
    }
}
