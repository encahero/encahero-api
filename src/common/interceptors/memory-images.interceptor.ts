import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface ImagesMemoryOptions {
    fieldName: string;
    allowedTypes?: string[];
    maxSizeMB?: number;
    maxCount?: number;
}

export function ImagesMemoryInterceptor({
    fieldName,
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
    maxSizeMB = 5,
    maxCount = 3,
}: ImagesMemoryOptions) {
    return FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
    });
}
