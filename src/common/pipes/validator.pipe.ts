import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

export const GlobalValidationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
        const message = errors
            .map((err) => Object.values(err.constraints || {}))
            .flat()
            .join(', ');

        console.log({ message });

        return new BadRequestException({
            status: 'VALIDATION_ERROR',
            statusCode: 400,
            message,
        });
    },
});
