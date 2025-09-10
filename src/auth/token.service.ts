import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

    async generateAccessToken(userId: string): Promise<string> {
        return  this.jwtService.sign({ userId }, { expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE'), secret: this.configService.get('SECRET_KEY') });
    }

    async generateRefreshToken(userId: string): Promise<string> {
        return   this.jwtService.sign({ userId }, { expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE'), secret: this.configService.get('REFRESH_KEY') });
    }

    async generateMagicToken(email: string): Promise<string> {
        return this.jwtService.sign({ email }, { expiresIn: '5m', secret: this.configService.get('MAGIC_KEY') });
    }

    async validateAccessToken(token: string): Promise<string | null> {
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get('SECRET_KEY') });
            return payload.userId;
        } catch (error) {
            return null;
        }
    }

    async validateRefreshToken(token: string): Promise<string | null> {
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get('REFRESH_KEY') });
            return payload.userId;
        } catch (error) {
            return null;
        }
    }

    async validateMagicToken(token: string): Promise<string | null> {
        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: this.configService.get('MAGIC_KEY') });
            return payload.email;
        } catch (error) {
            return null;
        }
    }

}