import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        code = `HTTP_${status}`;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = typeof r['message'] === 'string' ? r['message'] : message;
        code = typeof r['error'] === 'string' ? r['error'].toUpperCase().replace(/\s/g, '_') : `HTTP_${status}`;
        details = Array.isArray(r['message']) ? r['message'] : undefined;
      }
    }

    response.status(status).json({
      code,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
