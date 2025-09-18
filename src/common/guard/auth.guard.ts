import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/shared/utils/token/token.service';
import { ERROR_MESSAGES } from 'src/constants';
import AuthenticatedRequest from 'src/shared/interfaces/auth-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers['authorization'];
        if (!authHeader) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.MISSING_TOKEN);

        const token = authHeader.split(' ')[1];
        const result = await this.tokenService.validateAccessToken(token);

        if (!result) throw new UnauthorizedException(ERROR_MESSAGES.AUTH.ACCESSS_INVALID_TOKEN);
        const { userId, deviceId } = result;
        const user = await this.userRepo.findOne({ where: { id: Number(userId) } });

        if (!user) {
            throw new UnauthorizedException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        request.user = { userId: Number(userId), email: user.email, deviceId };

        return true;
    }
}
