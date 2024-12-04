import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import {
  CForbiddenException,
  CUnauthorizedException,
} from '@shared/custom-http-exception';

import { IS_PUBLIC_KEY } from '@src/decorator/is-public.decorator';
import { IS_PUBLIC_DECORATOR } from '@src/decorator/user.decorator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  // getRequest(context: ExecutionContext) {
  //   return context.switchToHttp().getRequest();
  // }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        err || new CUnauthorizedException('Unauthorized', 'Token not found')
      );
    }
    const isPublicPermission = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_DECORATOR,
      [context.getHandler(), context.getClass()],
    );
    const request: Request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route.path as string;
    const permissions = user?.permissions ?? [];
    let isPermission = permissions.find(
      (permission: {
        id: number;
        name: string;
        method: string;
        path: string;
      }) => {
        if (permission.method === method && permission.path === path) {
          return true;
        }
      },
    );
    if (path.startsWith('/api/v1/auth')) isPermission = true;
    if (!isPermission && !isPublicPermission) {
      throw new CForbiddenException(
        'Forbidden',
        'You do not have permission to access this resource',
      );
    }
    return user;
  }
}
