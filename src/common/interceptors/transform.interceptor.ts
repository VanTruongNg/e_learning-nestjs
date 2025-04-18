import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '../interfaces/response.interface';
import { StatusCode, ResponseMessage } from '../enums/api.enum';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    // Lấy response status từ controller
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || StatusCode.SUCCESS;

    return next.handle().pipe(
      map(data => {
        // Kiểm tra nếu data đã được wrap trong một object có trường data
        const responseData = data?.data ? data.data : data;
        return {
          status: statusCode,
          message: this.getMessageFromStatus(statusCode),
          data: responseData
        };
      }),
    );
  }

  private getMessageFromStatus(status: number): string {
    switch (status) {
      case StatusCode.CREATED:
        return ResponseMessage.CREATED;
      case StatusCode.SUCCESS:
      default:
        return ResponseMessage.SUCCESS;
    }
  }
}