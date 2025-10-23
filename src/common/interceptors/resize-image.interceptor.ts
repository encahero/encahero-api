import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { Request } from 'express';
import createFilePath from 'src/shared/utils/func/create-file-path';
interface ImageResizeOptions {
    uploadPath: string;
    width: number;
    height: number;
    quality?: number;
}

@Injectable()
export class ImageResizeInterceptor implements NestInterceptor {
    constructor(private options: ImageResizeOptions) {
        if (!fs.existsSync(this.options.uploadPath)) {
            fs.mkdirSync(this.options.uploadPath, { recursive: true });
        }
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest<Request>();
        const file = req.file;

        if (!file) return next.handle();

        // Tạo tên file duy nhất
        const { filename, filepath } = createFilePath(file, this.options.uploadPath);

        // Resize và lưu file
        await sharp(file.buffer)
            .rotate()
            .resize(this.options.width, this.options.height, {
                fit: 'inside',
            })
            .jpeg({ quality: this.options.quality ?? 80 })
            .toFile(filepath);

        // Cập nhật req.file cho controller
        req.file = {
            ...file,
            filename,
            path: filepath,
            size: fs.statSync(filepath).size,
        };

        return next.handle();
    }
}
