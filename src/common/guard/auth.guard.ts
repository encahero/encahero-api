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
        const userId = await this.tokenService.validateAccessToken(token);

        if (!userId) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCESSS_INVALID_TOKEN);

        request.user = { userId };

        return true;
    }
}
