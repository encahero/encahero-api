import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { Request } from 'express';
import createFilePath from 'src/shared/utils/func/create-file-path';
interface ImagesResizeOptions {
    uploadPath: string;
    width: number;
    height: number;
    quality?: number;
}

@Injectable()
export class ImagesResizeInterceptor implements NestInterceptor {
    constructor(private options: ImagesResizeOptions) {
        if (!fs.existsSync(this.options.uploadPath)) {
            fs.mkdirSync(this.options.uploadPath, { recursive: true });
        }
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<Request>();
        const files = req.files as Express.Multer.File[]; // nhận nhiều file

        if (!files || files.length === 0) return next.handle();

        const processedFiles: Express.Multer.File[] = [];

        for (const file of files) {
            const { filename, filepath } = createFilePath(file, this.options.uploadPath);

            await sharp(file.buffer)
                .rotate()
                .resize(this.options.width, this.options.height, { fit: 'inside' })
                .jpeg({ quality: this.options.quality ?? 80 })
                .toFile(filepath);

            processedFiles.push({
                ...file,
                filename,
                path: filepath,
                size: fs.statSync(filepath).size,
            });
        }

        // Cập nhật lại req.files
        req.files = processedFiles;

        return next.handle();
    }
}
