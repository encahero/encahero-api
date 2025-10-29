import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/cards/entities/card.entity';
import { ERROR_MESSAGES } from 'src/constants';
import { CardStatus, UserCardProgress } from 'src/progress/entities/user-card-progress.entity';
import { CollectionStatus, UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';
import { Not, Repository } from 'typeorm';
import { AnswerDto, QuestionType } from './dto/answer.dto';
import { UserDailyProgress } from 'src/progress/entities/user-daily-progress.entity';

import dayjs from 'src/config/dayjs.config';

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

    async randomQuizFromCollection(collectionId: number, userId: number, isMixed: boolean, limit: number) {
        const registered = await this.userCollectionProgressRepo.findOne({
            where: {
                collection_id: collectionId,
                user_id: userId,
                status: Not(CollectionStatus.STOPPED),
            },
        });

        if (!registered) throw new ForbiddenException(ERROR_MESSAGES.COLLECTION.NOT_REGISTERED_OR_NOT_IN_PROGRESS);

        const newCardQuantity = await this.canLearnNewCard(registered.collection_id, userId);
        let isNewCardQuery = false;
        const query = this.cardRepo
            .createQueryBuilder('card')
            .leftJoin(
                UserCardProgress,
                'card_progress',
                'card_progress.card_id = card.id AND card_progress.user_id = :userId',
                { userId },
            )
            .where('card.collection_id = :collectionId', { collectionId });

        if (registered.status === CollectionStatus.COMPLETED) {
            query.andWhere('card_progress.status = :mastered', { mastered: CardStatus.MASTERED });
        } else if (newCardQuantity > 0) {
            query.andWhere('card_progress.id IS NULL');
            isNewCardQuery = true;
        } else if (isMixed) {
            query.andWhere('card_progress.status IN (:...statuses)', {
                statuses: [CardStatus.ACTIVE, CardStatus.MASTERED],
            });
        } else {
            query.andWhere('card_progress.status = :active', { active: CardStatus.ACTIVE });
        }

        query.orderBy('RANDOM()').limit(newCardQuantity || limit);

        const cards = await query.getMany();

        return cards.map((card) => ({
            ...card,
            isNew: !!isNewCardQuery,
        }));
    }

    async answerQuiz(collectionId: number, cardId: number, userId: number, timeZone: string, answer: AnswerDto) {
        const registered = await this.userCollectionProgressRepo.findOne({
            where: {
                collection_id: collectionId,
                user_id: userId,
            },
        });

        if (!registered) throw new ForbiddenException(ERROR_MESSAGES.COLLECTION.NOT_REGISTERED_OR_NOT_IN_PROGRESS);

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

        // increase daily progress
        const now = dayjs().tz(timeZone);
        const last = registered.last_reviewed_at;
        if (!last || dayjs(last).tz(timeZone).format('YYYY-MM-DD') !== now.format('YYYY-MM-DD')) {
            // Sang ngày mới theo timezone user
            registered.today_learned_count = 0;
            registered.today_new_count = 0;
        }

        registered.today_learned_count++;
        registered.last_reviewed_at = now.utc().toDate();

        const startOfDayUTC = now.startOf('day').utc().toDate();

        let dailyProgress = await this.userDailyProgressRepo.findOne({
            where: { user_id: userId, date: startOfDayUTC },
        });

        if (!dailyProgress) {
            dailyProgress = this.userDailyProgressRepo.create({
                user_id: userId,
                date: startOfDayUTC,
                card_answered: 1,
            });
        } else {
            dailyProgress.card_answered++;
        }

        await this.userCardProgressRepo.save(userCardProgress);
        await this.userDailyProgressRepo.save(dailyProgress);
        await this.userCollectionProgressRepo.save(registered);
        return {
            collection: registered,
        };
    }

    private async canLearnNewCard(collectionId: number, userId: number) {
        const progress = await this.userCollectionProgressRepo.findOne({
            where: { collection_id: collectionId, user_id: userId },
            relations: ['collection'],
        });

        if (!progress) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_REGISTERED_OR_NOT_IN_PROGRESS);
        }

        const totalCards = await this.cardRepo.count({ where: { collection: { id: collectionId } } });
        const learnedCards = await this.userCardProgressRepo.count({
            where: { collection_id: collectionId, user_id: userId },
        });
        const masteredCards = await this.userCardProgressRepo.count({
            where: { collection_id: collectionId, user_id: userId, status: CardStatus.MASTERED },
        });

        // Số lượng card mới tối đa theo daily limit
        const remainingDailyNew = progress.daily_new_limit - progress.today_new_count;
        // Số lượng card mới còn lại trong collection
        const remainingCollectionNew = totalCards - learnedCards;

        const canLearnNewToday =
            progress.today_new_count < progress.daily_new_limit &&
            totalCards > learnedCards &&
            (progress.today_learned_count >= progress.task_count ||
                (learnedCards === masteredCards && masteredCards < totalCards));

        // Nếu không thỏa điều kiện, return 0
        if (!canLearnNewToday && !(learnedCards === 0 || learnedCards < progress.daily_new_limit)) {
            return 0;
        }

        return Math.min(remainingDailyNew, remainingCollectionNew);
    }
}
