import * as path from 'path';

export default function createFilePath(file: Express.Multer.File, uploadPath: string) {
    const ext = path.extname(file.originalname) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(uploadPath, filename);

    return { filepath, filename };
}
