import { ExecutionContext } from '@nestjs/common';

import { User } from '@modules/user/entities/user.entity';

export const userFromContext = (context: ExecutionContext) => {
  const contextType = context.getType();

  switch (contextType) {
    case 'http':
      return context.switchToHttp().getRequest().user as User;
    // case 'ws':
    //   return +context.switchToWs().getClient().user.user_identifier;
    // case 'rpc':
    default:
      return context.switchToRpc().getContext().user as User;
  }
};
