import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/cards/entities/card.entity';
import { ERROR_MESSAGES } from 'src/constants';
import { CardStatus, UserCardProgress } from 'src/progress/entities/user-card-progress.entity';
import { CollectionStatus, UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';
import { Repository } from 'typeorm';
import { AnswerDto, QuestionType } from './dto/answer.dto';
import { UserDailyProgress } from 'src/progress/entities/user-daily-progress.entity';
import { format } from 'date-fns';
import type { RandomQuizMode } from 'src/shared/types';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(UserCollectionProgress)
        private readonly userCollectionProgressRepo: Repository<UserCollectionProgress>,
        @InjectRepository(Card)
        private readonly cardRepo: Repository<Card>,
        @InjectRepository(UserCardProgress)
        private readonly userCardProgressRepo: Repository<UserCardProgress>,
        @InjectRepository(UserDailyProgress)
        private readonly userDailyProgressRepo: Repository<UserDailyProgress>,
    ) {}
    async randomQuiz() {}

    async randomQuizFromCollection(collectionId: number, userId: number, mode: RandomQuizMode, limit: number) {
        const registered = await this.userCollectionProgressRepo.findOne({
            where: {
                collection_id: collectionId,
                user_id: userId,
                status: CollectionStatus.IN_PROGRESS,
            },
        });

        if (!registered) throw new ForbiddenException(ERROR_MESSAGES.COLLECTION.NOT_REGISTED_OR_NOT_IN_PROGRESS);

        const query = this.cardRepo
            .createQueryBuilder('card')
            .leftJoin(
                UserCardProgress,
                'card_progress',
                'card_progress.card_id = card.id AND card_progress.user_id = :userId',
                { userId },
            )
            .where('card.collection_id = :collectionId', { collectionId });

        switch (mode) {
            case 'old':
                query.andWhere('card_progress.status = :active', { active: CardStatus.ACTIVE });
                break;
            case 'new':
                query.andWhere('card_progress.id IS NULL');
                break;
            case 'mixed':
                query.andWhere('card_progress.status IN (:...statuses)', {
                    statuses: [CardStatus.ACTIVE, CardStatus.MASTERED],
                });
                break;
            default:
                throw new NotFoundException(ERROR_MESSAGES.QUIZ.MODE_NOT_FOUND);
        }

        query.orderBy('RANDOM()').limit(limit);

        const cards = await query.getMany();
        return cards;
    }

    async answerQuiz(collectionId: number, cardId: number, userId: number, answer: AnswerDto) {
        const registered = await this.userCollectionProgressRepo.findOne({
            where: {
                collection_id: collectionId,
                user_id: userId,
                status: CollectionStatus.IN_PROGRESS,
            },
        });

        if (!registered) throw new ForbiddenException(ERROR_MESSAGES.COLLECTION.NOT_REGISTED_OR_NOT_IN_PROGRESS);

        // check card exist
        const isCardExisting = await this.cardRepo.findOne({
            where: {
                collection: { id: collectionId },
                id: cardId,
            },
        });

        if (!isCardExisting) throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);

        let userCardProgress = await this.userCardProgressRepo.findOne({
            where: { user_id: userId, card_id: cardId, collection_id: collectionId },
        });

        if (!userCardProgress) {
            userCardProgress = this.userCardProgressRepo.create({
                user_id: userId,
                card_id: cardId,
                collection_id: collectionId,
                learned_count: 0,
            });
        }

        if (answer.questionType === QuestionType.RATING && answer.ratingValue) {
            userCardProgress.rating = answer.ratingValue;
        }
        userCardProgress.learned_count++;
        await this.userCardProgressRepo.save(userCardProgress);

        // increase daily progress
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        let dailyProgress = await this.userDailyProgressRepo.findOne({
            where: { user_id: userId, date: todayStr },
        });

        if (!dailyProgress) {
            dailyProgress = this.userDailyProgressRepo.create({
                user_id: userId,
                date: todayStr,
                card_answered: 1,
            });
        } else {
            dailyProgress.card_answered++;
        }

        await this.userDailyProgressRepo.save(dailyProgress);

        // increase today learned count of collection

        const lastReviewStr = format(registered.last_reviewed_at, 'yyyy-MM-dd');
        if (todayStr !== lastReviewStr) {
            // Qua ngày mới → reset count
            registered.today_learned_count = 0;
        }

        // tăng count hôm nay
        registered.today_learned_count++;
        registered.last_reviewed_at = now;
        await this.userCollectionProgressRepo.save(registered);
        return true;
    }
}
