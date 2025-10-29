import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/constants';
import { CollectionStatus, UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';
import { CardStatus, UserCardProgress } from 'src/progress/entities/user-card-progress.entity';
import { Card } from 'src/cards/entities/card.entity';
import dayjs from 'src/config/dayjs.config';
import { UserDailyProgress } from 'src/progress/entities/user-daily-progress.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Role } from 'src/shared/enums';

interface RawCollection {
    mastered_card_count: number;
    learned_card_count?: number;
}
@Injectable()
export class CollectionsService {
    constructor(
        @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(UserCardProgress) private readonly userCardProgressRepo: Repository<UserCardProgress>,
        @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
        @InjectRepository(UserCollectionProgress)
        private readonly userCollectionProgressRepo: Repository<UserCollectionProgress>,
        @InjectRepository(UserDailyProgress)
        private readonly userDailyProgressRepo: Repository<UserDailyProgress>,
    ) {}

    async create(createCollectionDto: CreateCollectionDto) {
        const { name, categoryName, icon } = createCollectionDto;
        const existing = await this.collectionRepo.findOne({ where: { name } });
        if (existing) {
            throw new BadRequestException(ERROR_MESSAGES.COLLECTION.EXISTED);
        }

        const category = await this.categoryRepo.findOne({ where: { name: categoryName } });
        if (!category) {
            throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
        }

        const collection = this.collectionRepo.create({
            name,
            category,
            icon: icon || null,
        });

        const newCol = await this.collectionRepo.save(collection);
        return newCol;
    }

    async findAll(userId?: number, role?: Role) {
        const qb = this.collectionRepo
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.category', 'category')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCollectionProgress, 'ucp')
                        .where('ucp.collection_id = collection.id'),
                'registered_count',
            );

        if (role !== Role.ADMIN) {
            qb.where('collection.is_public = true');
        }

        if (userId) {
            qb.leftJoin('user_collection_progress', 'uc', 'uc.collection_id = collection.id AND uc.user_id = :userId', {
                userId,
            })
                .addSelect('COUNT(uc.id) > 0', 'is_registered')
                .addSelect("MAX(CASE WHEN uc.status = 'stopped' THEN 1 ELSE 0 END) = 1", 'is_stopped')
                .addSelect("MAX(CASE WHEN uc.status = 'completed' THEN 1 ELSE 0 END) = 1", 'is_completed')
                .groupBy('collection.id, category.id, category.name');
        }

        const collections = await qb.getRawAndEntities<{
            is_registered?: number;
            is_stopped?: boolean;
            is_completed?: boolean;
            registered_count?: number;
        }>();

        // Nếu có userId → map thêm is_registered
        if (userId) {
            return collections.entities.map((collection, index) => ({
                ...collection,
                is_registered: Number(collections.raw[index]['is_registered']) > 0,
                is_stopped: Boolean(collections.raw[index]['is_stopped']),
                is_completed: Boolean(collections.raw[index]['is_completed']),
                registered_count: Number(collections.raw[index]['registered_count'] ?? 0),
            }));
        }

        return collections.entities.map((collection, index) => ({
            ...collection,
            registered_count: Number(collections.raw[index]['registered_count'] ?? 0),
        }));
    }

    async getStopCollection(userId: number) {
        const collections = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .select(['progress', 'collection.id', 'collection.name'])
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id')
                        .andWhere('ucp.status = :status', { status: CardStatus.MASTERED }),
                'mastered_card_count',
            )
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id'),
                'learned_card_count',
            )
            .where('progress.user_id = :userId and progress.status = :progressStatus', {
                userId,
                progressStatus: CollectionStatus.STOPPED,
            })
            .getRawAndEntities<RawCollection>();

        return collections.entities.map((c, index) => ({
            ...c.collection,
            mastered_card_count: Number(collections.raw[index].mastered_card_count),
            learned_card_count: Number(collections.raw[index].learned_card_count ?? 0),
        }));
    }

    async getCompletedCollection(userId: number) {
        const collections = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .select(['progress', 'collection.id', 'collection.name'])
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id')
                        .andWhere('ucp.status = :status', { status: CardStatus.MASTERED }),
                'mastered_card_count',
            )
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id'),
                'learned_card_count',
            )
            .where('progress.user_id = :userId and progress.status = :progressStatus', {
                userId,
                progressStatus: CollectionStatus.COMPLETED,
            })
            .getRawAndEntities<RawCollection>();

        return collections.entities.map((c, index) => ({
            ...c.collection,
            mastered_card_count: Number(collections.raw[index].mastered_card_count),
            learned_card_count: Number(collections.raw[index].learned_card_count ?? 0),
        }));
    }

    async findOne(id: number, userId: number) {
        const collections = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .select(['progress', 'collection.id', 'collection.name'])
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id')
                        .andWhere('ucp.status = :status', { status: CardStatus.MASTERED }),
                'mastered_card_count',
            )
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id'),
                'learned_card_count',
            )
            .where('progress.user_id = :userId AND progress.collection_id = :collectionId', {
                userId,
                collectionId: id,
            })
            .getRawAndEntities<RawCollection>();

        if (!collections.entities.length) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        const c = collections.entities[0];
        const raw = collections.raw[0];

        return {
            ...c, // trả về entity gốc
            mastered_card_count: Number(raw.mastered_card_count),
            learned_card_count: Number(raw.learned_card_count ?? 0),
            is_registered: true,
        };
    }

    async update(id: number, updateCollectionDto: UpdateCollectionDto) {
        const { name, categoryName, icon, isPublic } = updateCollectionDto;

        const collection = await this.collectionRepo.findOne({ where: { id } });
        if (!collection) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        if (name && name !== collection.name) {
            const existing = await this.collectionRepo.findOne({ where: { name } });
            if (existing && existing.id !== id) {
                throw new BadRequestException(ERROR_MESSAGES.COLLECTION.EXISTED);
            }
            collection.name = name;
        }

        if (categoryName && categoryName !== collection.category.name) {
            const category = await this.categoryRepo.findOne({ where: { name: categoryName } });
            if (!category) {
                throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
            }
            collection.category = category;
        }

        collection.icon = icon || null;
        collection.is_public = isPublic || false;

        await this.collectionRepo.save(collection);
        return true;
    }

    async remove(id: number) {
        const collection = await this.collectionRepo.findOne({
            where: { id },
            relations: ['cards', 'userProgress'],
        });

        if (!collection) {
            throw new NotFoundException(`Collection with ID ${id} not found`);
        }

        if ((collection.cards?.length || 0) > 0 || (collection.userProgress?.length || 0) > 0) {
            throw new BadRequestException(
                `Cannot delete collection because it has ${collection.cards.length} cards or ${collection.userProgress.length} user progress entries`,
            );
        }

        const removedCollection = { ...collection };
        await this.collectionRepo.remove(collection);

        return removedCollection;
    }

    async registerCollection(id: number, taskNum: number, userId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id, is_public: true } });
        if (!collection) throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);

        // check if registered
        const existingProgress = await this.userCollectionProgressRepo.findOne({
            where: { user_id: userId, collection_id: id },
        });

        if (existingProgress) throw new ConflictException(ERROR_MESSAGES.COLLECTION.ALREADY_REGISTERED);

        const newProgress = this.userCollectionProgressRepo.create({
            user_id: userId,
            collection_id: id,
            started_at: new Date(),
            last_reviewed_at: new Date(),
            task_count: taskNum,
            status: CollectionStatus.IN_PROGRESS,
        });

        await this.collectionRepo.save(collection);

        await this.userCollectionProgressRepo.save(newProgress);

        const progressWithCount = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .select(['progress', 'collection.id', 'collection.name', 'collection.icon'])
            .where('progress.id = :id', { id: newProgress.id })
            .getOne();

        return progressWithCount;
    }

    async getMyOwnCollection(userId: number, timeZone: string) {
        const collections = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .select(['progress', 'collection.id', 'collection.name', 'collection.icon', 'collection.is_public'])
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id')
                        .andWhere('ucp.status = :status', { status: CardStatus.MASTERED }),
                'mastered_card_count',
            )
            .addSelect(
                (subQuery) =>
                    subQuery
                        .select('COUNT(*)')
                        .from(UserCardProgress, 'ucp')
                        .where('ucp.user_id = :userId', { userId })
                        .andWhere('ucp.collection_id = progress.collection_id'),
                'learned_card_count',
            )
            .where('progress.user_id = :userId', {
                userId,
            })
            .andWhere('collection.is_public = true')
            .getRawAndEntities<RawCollection>();

        const now = dayjs().tz(timeZone);
        const resetList: typeof collections.entities = [];

        for (const progress of collections.entities) {
            const last = progress.last_reviewed_at;
            if (!last || dayjs(last).tz(timeZone).format('YYYY-MM-DD') !== now.format('YYYY-MM-DD')) {
                // Sang ngày mới theo timezone user
                progress.today_learned_count = 0;
                progress.today_new_count = 0;
                resetList.push(progress);
            }
        }

        // Lưu lại nếu có progress bị reset
        if (resetList.length > 0) {
            await this.userCollectionProgressRepo.save(resetList);
        }

        return collections.entities.map((c, index) => ({
            ...c,
            mastered_card_count: Number(collections.raw[index].mastered_card_count),
            learned_card_count: Number(collections.raw[index].learned_card_count ?? 0),
            is_registered: true,
        }));
    }

    async updateStatusOfUserCollection(id: number, userId: number, status: CollectionStatus) {
        const progress = await this.userCollectionProgressRepo.findOne({
            where: { user_id: userId, collection_id: id },
        });

        if (!progress) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        if (status === CollectionStatus.COMPLETED)
            throw new ForbiddenException(ERROR_MESSAGES.COLLECTION.CANNOT_CHANGE_TO_COMPLETE_STATUS);

        progress.status = status;

        if (status === CollectionStatus.STOPPED) progress.stopped_at = new Date();

        await this.userCollectionProgressRepo.save(progress);

        return {
            collectionId: id,
            status: progress.status,
            stopedAt: progress.started_at,
        };
    }

    async updateTaskCountOfUserCollection(id: number, userId: number, taskCount: number) {
        const progress = await this.userCollectionProgressRepo.findOne({
            where: { user_id: userId, collection_id: id, status: CollectionStatus.IN_PROGRESS },
        });

        if (!progress) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_REGISTERED_OR_NOT_IN_PROGRESS);
        }

        progress.task_count = taskCount;

        await this.userCollectionProgressRepo.save(progress);

        return {
            collectionId: id,
            status: progress.status,
            task_count: progress.task_count,
            stopedAt: progress.started_at,
        };
    }

    async updateCardStatus(collectionId: number, cardId: number, userId: number, status: CardStatus, timeZone: string) {
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

        if (!userCardProgress) throw new NotFoundException(ERROR_MESSAGES.CARD.CARD_PROGRESS_NOT_FOUND);

        userCardProgress.status = status;
        await this.userCardProgressRepo.save(userCardProgress);

        let collectionCompleted = false;
        // count card mastered
        const masteredCards = await this.userCardProgressRepo.count({
            where: { user_id: userId, collection_id: collectionId, status: CardStatus.MASTERED },
        });

        const totalCards = await this.cardRepo.count({ where: { collection: { id: collectionId } } });

        const collectionProgress = await this.userCollectionProgressRepo.findOne({
            where: { user_id: userId, collection_id: collectionId },
        });

        if (!collectionProgress) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        if (status === CardStatus.MASTERED) {
            const now = dayjs().tz(timeZone);
            const last = collectionProgress.last_reviewed_at;

            // reset in new day
            if (!last || dayjs(last).tz(timeZone).format('YYYY-MM-DD') !== now.format('YYYY-MM-DD')) {
                collectionProgress.today_learned_count = 0;
                collectionProgress.today_new_count = 0;
            }

            // increase daily progress
            collectionProgress.today_learned_count++;
            collectionProgress.last_reviewed_at = now.utc().toDate();

            if (masteredCards >= totalCards) {
                collectionProgress.status = CollectionStatus.COMPLETED;
                collectionProgress.completed_at = new Date();
                collectionCompleted = true;
            }

            await this.userCollectionProgressRepo.save(collectionProgress);
            userCardProgress.learned_count++;
            await this.userCardProgressRepo.save(userCardProgress);

            const startOfDay = dayjs(now).tz(timeZone).startOf('day').toDate();
            let dailyProgress = await this.userDailyProgressRepo.findOne({
                where: { user_id: userId, date: startOfDay },
            });

            if (!dailyProgress) {
                dailyProgress = this.userDailyProgressRepo.create({
                    user_id: userId,
                    date: startOfDay,
                    card_answered: 1,
                });
            } else {
                dailyProgress.card_answered++;
            }

            await this.userDailyProgressRepo.save(dailyProgress);
        } else if (status === CardStatus.ACTIVE) {
            if (masteredCards <= totalCards - 1) {
                if (collectionProgress) {
                    collectionProgress.status = CollectionStatus.IN_PROGRESS;
                    collectionProgress.completed_at = null;
                    await this.userCollectionProgressRepo.save(collectionProgress);
                    collectionCompleted = false;
                }
            }
        }

        return { ...userCardProgress, collectionCompleted, collection: collectionProgress };
    }

    async findCardsOfCollection(collectionId: number, userId?: number) {
        const query = this.cardRepo
            .createQueryBuilder('card')
            .leftJoinAndSelect('card.collection', 'collection')
            .where('card.collection_id = :collectionId', { collectionId });

        if (userId) {
            query
                .leftJoinAndMapOne(
                    'card.stats',
                    'user_card_progress',
                    'progress',
                    'progress.card_id = card.id AND progress.user_id = :userId',
                    { userId },
                )
                .select([
                    'card.id',
                    'card.en_word',
                    'card.vn_word',
                    'card.meaning',
                    'card.image_url',
                    'collection.id',
                    'card.type',
                    'progress.status',
                    'progress.rating',
                    'progress.learned_count',
                ]);
        } else {
            query.select([
                'card.id',
                'card.en_word',
                'card.vn_word',
                'card.meaning',
                'collection.id',
                'card.type',
                'card.image_url',
            ]);
        }
        const cards = await query.getMany();

        if (!cards) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        return cards;
    }

    async findMasteredCardsOfCollection(collectionId: number, userId: number) {
        // check collection
        const collection = await this.userCollectionProgressRepo.find({ where: { id: collectionId, user_id: userId } });

        if (!collection) throw new NotFoundException(ERROR_MESSAGES.COLLECTION.COLLECTION_PROGRESS_NOT_FOUND);

        const cards = await this.userCardProgressRepo.find({
            where: { collection_id: collectionId, user_id: userId, status: CardStatus.MASTERED },
        });

        return cards ?? [];
    }
}
