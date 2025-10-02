import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type AuthenticatedRequest from 'src/shared/interfaces/auth-request';
export const User = createParamDecorator((data: 'id' | 'deviceId' | 'email' | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;
    console.log('user.decorator - user:', user);
    if (!user) return null;

    switch (data) {
        case 'id':
            return user.userId;
        case 'email':
            return user.email;
        case 'deviceId':
            return user.deviceId;
        default:
            return user;
    }
});
