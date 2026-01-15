// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Get the required roles for this route (e.g., ['ADMIN'])
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. If no roles are required, let everyone in
        if (!requiredRoles) {
            return true;
        }

        // 3. Get the user from the request (attached by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        // 4. Check if the user has the required role
        return requiredRoles.some((role) => user.role === role);
    }
}