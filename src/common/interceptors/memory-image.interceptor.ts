import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

interface ImageMemoryOptions {
    fieldName: string;
    allowedTypes?: string[];
    maxSizeMB?: number;
}

export function ImageMemoryInterceptor({
    fieldName,
    allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
    maxSizeMB = 5,
}: ImageMemoryOptions) {
    return FileInterceptor(fieldName, {
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
