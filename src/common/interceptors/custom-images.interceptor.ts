import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

interface CustomImagesInterceptorOptions {
    fieldName: string;
    maxCount?: number;
    uploadPath: string;
    allowedTypes?: string[];
    maxSizeMB?: number;
}

export function CustomImagesInterceptor({
    fieldName,
    maxCount = 5,
    uploadPath,
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
    maxSizeMB = 5,
}: CustomImagesInterceptorOptions) {
    return FilesInterceptor(fieldName, maxCount, {
        storage: diskStorage({
            destination: uploadPath,
            filename: (req, file, cb) => {
                const ext = path.extname(file.originalname) || '.png';
                const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                cb(null, uniqueName);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: (maxSizeMB || 5) * 1024 * 1024 },
    });
}
