import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getRequestContext } from 'src/logging/request-context';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  code?: string;
  requestId?: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, code } = this.extract(exception, isHttp);

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      ...(code !== undefined && { code }),
      requestId: getRequestContext()?.requestId,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (!isHttp || status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }

  private extract(
    exception: unknown,
    isHttp: boolean,
  ): { message: string; code?: string } {
    if (isHttp) {
      const res = (exception as HttpException).getResponse();
      if (typeof res === 'string') return { message: res };
      const obj = res as { message?: unknown; code?: unknown };
      const message = Array.isArray(obj.message)
        ? obj.message.join('; ')
        : typeof obj.message === 'string'
          ? obj.message
          : (exception as HttpException).message;
      const code = typeof obj.code === 'string' ? obj.code : undefined;
      return { message, code };
    }
    return { message: 'Internal server error' };
  }
}
