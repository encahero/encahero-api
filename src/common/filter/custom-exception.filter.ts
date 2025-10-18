// src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { errorResponse } from '../response';

const VALIDATION_ERROR = 'VALIDATION_ERROR';

@Catch()
export class CustomExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        console.log({ exception });
        let status: number;
        let message: string = 'Internal Server Error';
        let customStatus: string | undefined = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (res && typeof res === 'object') {
                // Nếu response là object
                const maybeMessage = (res as { message?: string | string[] }).message;
                const statusText = (res as { status?: string }).status;
                if (statusText === VALIDATION_ERROR) {
                    customStatus = VALIDATION_ERROR;
                }
                if (typeof maybeMessage === 'string') {
                    message = maybeMessage;
                } else if (Array.isArray(maybeMessage)) {
                    message = maybeMessage.join(', '); // array
                } else {
                    message = exception.message; // fallback
                }
            } else {
                message = exception.message; // fallback
            }
        } else {
            // All other unexpected errors
            status = HttpStatus.INTERNAL_SERVER_ERROR;

            message = exception instanceof Error ? exception.message : String(exception);
            console.log('Internal Error ', message);
            message = 'Internal Server Error';
        }

        response.status(status).json({
            ...errorResponse(status, message, customStatus),
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
