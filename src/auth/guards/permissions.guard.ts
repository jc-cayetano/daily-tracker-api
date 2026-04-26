import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '../entities/user.entity';
import { ROLE_PERMISSIONS } from '../permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    interface AuthenticatedRequest {
      user: { id: string; username: string; role: UserRole };
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions: string[] = ROLE_PERMISSIONS[request.user.role] ?? [];

    const hasPermission: boolean = requiredPermissions.every(
      (permission: string) => userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
