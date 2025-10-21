import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decarators/role.decorator';
import AuthenticatedRequest from 'src/shared/interfaces/auth-request';
import { Role } from 'src/shared/enums';
import { ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) return false;

        const hasPermisstion = requiredRoles.some((role: Role) => role === user.role);
        if (!hasPermisstion) throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSION);
        return true;
    }
}
