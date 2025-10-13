import { Controller, Post, Body, HttpStatus, UseInterceptors, UploadedFiles, UseGuards, Get } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @UseGuards(AuthGuard)
    @Post()
    @UseInterceptors(
        FilesInterceptor('images', 5, {
            storage: diskStorage({
                destination: './uploads/feedback',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.random().toString(36).slice(2);
                    cb(null, unique + '-' + file.originalname);
                },
            }),
        }),
    )
    async create(
        @User('id') userId: number,
        @Body('text') text: string,
        @UploadedFiles() images: Express.Multer.File[],
    ) {
        const data = await this.feedbackService.create(userId, text, images);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.FEEDBACK.CREATE, data);
    }

    @Get()
    async findAll() {
        const data = await this.feedbackService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.FEEDBACK.CREATE, data);
    }
}
