import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES } from '../../common/decorators/roles.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { Request } from 'express';

/**
 * AdminGuard — ensures the request comes from a user with an admin-tier role.
 * Apply this at the controller class level for the entire /admin namespace.
 * It is complementary to RolesGuard which handles fine-grained endpoint access.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const user = request.user;
    if (!user) throw new UnauthorizedException('Authentication required');

    const isAdmin = ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]);
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
