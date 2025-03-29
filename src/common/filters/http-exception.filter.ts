import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/response.interface';
import { StatusCode, ResponseMessage } from '../enums/api.enum';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Xử lý lỗi validation
    if (exception instanceof BadRequestException) {
      const validationErrors = exception.getResponse();
      
      // Kiểm tra nếu là lỗi validation từ class-validator
      if (typeof validationErrors === 'object' && 'message' in validationErrors) {
        const messages = Array.isArray(validationErrors.message)
          ? validationErrors.message
          : [validationErrors.message];

        const errorResponse: ErrorResponse = {
          status: status,
          message: messages.join(', ')
        };

        return response.status(status).json(errorResponse);
      }
    }

    // Xử lý các lỗi khác
    const errorResponse: ErrorResponse = {
      status: status,
      message: this.getMessageFromStatus(status, exception.message)
    };

    response.status(status).json(errorResponse);
  }

  private getMessageFromStatus(status: number, message: string): string {
    // Nếu có message cụ thể từ exception, ưu tiên sử dụng
    if (message && message !== 'Http Exception') {
      return message;
    }

    // Nếu không có message cụ thể, sử dụng message mặc định theo status
    switch (status) {
      case StatusCode.BAD_REQUEST:
        return ResponseMessage.BAD_REQUEST;
      case StatusCode.UNAUTHORIZED:
        return ResponseMessage.UNAUTHORIZED;
      case StatusCode.FORBIDDEN:
        return ResponseMessage.FORBIDDEN;
      case StatusCode.NOT_FOUND:
        return ResponseMessage.NOT_FOUND;
      case StatusCode.INTERNAL_SERVER:
        return ResponseMessage.INTERNAL_SERVER;
      case StatusCode.CONFLICT:
        return ResponseMessage.CONFLICT;
      default:
        return 'Lỗi không xác định';
    }
  }
}