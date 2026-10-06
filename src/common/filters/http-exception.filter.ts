import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã xảy ra lỗi không xác định trên hệ thống.';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        errorDetails = res;
      }
    } else if (exception instanceof Error) {
      // ORM messages may contain credentials and child data. Never echo or log them.
      this.logger.error('Unhandled server error; inspect a sanitized diagnostic in a controlled environment.');
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errorDetails,
      timestamp: new Date().toISOString(),
    });
  }
}
