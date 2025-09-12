import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('CLIENT-REQUEST');
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            const duration = Date.now() - start;
            this.logger.verbose(`${method} ${originalUrl} ${statusCode} ${contentLength ?? 0} - ${duration}ms`);
            // TODO: write log to file
        });

        next();
    }
}
