import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { userFromContext } from '@shared/user-from-context';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return userFromContext(ctx);
  },
);

export const IS_PUBLIC_DECORATOR = 'isPublicPermission';
export const SkipCheckPermission = () => SetMetadata(IS_PUBLIC_DECORATOR, true);
