import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedbackService {
    constructor(@InjectRepository(Feedback) private readonly feedbackRepo: Repository<Feedback>) {}

    async create(userId: number, text: string, images: Express.Multer.File[]) {
        const imagePaths = images?.map((file) => file.filename) || [];

        const feedback = this.feedbackRepo.create({
            user_id: userId,
            text,
            images: imagePaths,
        });

        return await this.feedbackRepo.save(feedback);
    }

    async findAll() {
        const feedbacks = await this.feedbackRepo.find({});

        return feedbacks;
    }
}
