import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { TransformResponse } from '@shared/response';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE } from '@src/decorator/message.decorator';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: any;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, TransformResponse<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof TransformResponse) {
          return res;
        } else {
          return {
            message:
              this.reflector.get<string>(
                RESPONSE_MESSAGE,
                context.getHandler(),
              ) || 'success',
            code: ApiResponseCode.OK,
            params: null,
            data: res || null,
          };
        }
      }),
    );
  }
}
