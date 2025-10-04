import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type AuthenticatedRequest from 'src/shared/interfaces/auth-request';
export const User = createParamDecorator(
    (data: 'id' | 'deviceId' | 'email' | 'time_zone' | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;
        if (!user) return null;

        switch (data) {
            case 'id':
                return user.userId;
            case 'email':
                return user.email;
            case 'deviceId':
                return user.deviceId;
            case 'time_zone':
                return user.time_zone;
            default:
                return user;
        }
    },
);
