import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from 'src/shared/utils/token/token.service';
import AuthenticatedRequest from 'src/shared/interfaces/auth-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    constructor(
        private readonly tokenService: TokenService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers['authorization'];

        // Không có token thì cho qua, request.user = undefined
        if (!authHeader) {
            request.user = undefined;
            return true;
        }

        const token = authHeader.split(' ')[1];
        try {
            const result = await this.tokenService.validateAccessToken(token);

            if (!result) {
                request.user = undefined;
                return true;
            }

            const { userId, deviceId } = result;
            const user = await this.userRepo.findOne({ where: { id: Number(userId) } });

            if (!user) {
                request.user = undefined;
                return true;
            }

            request.user = { userId: Number(userId), email: user.email, deviceId, role: user.role };
        } catch {
            // Token sai/expired → user = undefined
            request.user = undefined;
        }

        return true; // luôn cho qua
    }
}
