import { Controller, Post, Body, HttpStatus, UseInterceptors, UploadedFiles, UseGuards, Get } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';

import { FOLDER_FEEDBACKS, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';
import { Role } from 'src/shared/enums';
import { Roles } from 'src/common/decarators/role.decorator';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { ImagesMemoryInterceptor } from 'src/common/interceptors/memory-images.interceptor';
import { ImagesResizeInterceptor } from 'src/common/interceptors/resize-images.interceptor';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @UseGuards(AuthGuard)
    @Post()
    // @UseInterceptors(
    //     CustomImagesInterceptor({
    //         fieldName: 'images',
    //         maxCount: 5,
    //         uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_FEEDBACKS}`,
    //     }),
    //     )
    @UseInterceptors(
        ImagesMemoryInterceptor({ fieldName: 'images' }),
        new ImagesResizeInterceptor({
            uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_FEEDBACKS}`,
            width: 500,
            height: 500,
            quality: 100,
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    async findAll() {
        const data = await this.feedbackService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.FEEDBACK.FIND_ALL, data);
    }
}
