import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/shared/utils/token/token.service';
import { ERROR_MESSAGES } from 'src/constants';
import AuthenticatedRequest from 'src/shared/interfaces/auth-request';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers['authorization'];
        console.log('Auth Guard');
        if (!authHeader) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.MISSING_TOKEN);

        const token = authHeader.split(' ')[1];
        const result = await this.tokenService.validateAccessToken(token);

        if (!result) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCESSS_INVALID_TOKEN);
        const { userId, deviceId } = result;
        request.user = { userId, deviceId };

        return true;
    }
}
