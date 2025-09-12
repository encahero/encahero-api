import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
    status: string;
    statusCode: HttpStatus;
    message: string;
    data?: T;
}

export function successResponse<T>(statusCode = HttpStatus.OK, message = 'Success', data?: T): ApiResponse<T> {
    const status = HttpStatus[statusCode] || 'OK';
    return {
        status,
        statusCode,
        message,
        data,
    };
}

export function errorResponse(
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string,
    customStatus?: string,
): ApiResponse {
    const status = customStatus || HttpStatus[statusCode] || 'ERROR';
    return {
        status,
        statusCode,
        message,
    };
}
