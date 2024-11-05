import { ExecutionContext } from '@nestjs/common';

import { User } from '@modules/user/entities/user.entity';
import { IUser } from '@modules/user/interface/user.interface';

export const userFromContext = (context: ExecutionContext) => {
  const contextType = context.getType();

  switch (contextType) {
    case 'http':
      return context.switchToHttp().getRequest().user as User;
    case 'ws':
      const user: IUser = context.switchToWs().getClient().user;
      return { id: user.id, email: user.email } as IUser;
    // case 'rpc':
    default:
      return context.switchToRpc().getContext().user as User;
  }
};
