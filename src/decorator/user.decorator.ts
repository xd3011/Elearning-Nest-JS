import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { userFromContext } from '@shared/user-from-context';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return userFromContext(ctx);
  },
);

export const IS_PUBLIC_DECORATOR = 'isPublicPermission';
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_DECORATOR, true);
