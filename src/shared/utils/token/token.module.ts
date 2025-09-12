// src/auth/token.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './token.service';

@Global() // token service sẽ global, không cần import nhiều lần
@Module({
    imports: [ConfigModule, JwtModule.register({})],
    providers: [TokenService],
    exports: [TokenService], // export để module khác dùng
})
export class TokenModule {}
