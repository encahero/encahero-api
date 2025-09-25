import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/constants';
import { CollectionStatus, UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';
import { CardStatus, UserCardProgress } from 'src/progress/entities/user-card-progress.entity';
import { Card } from 'src/cards/entities/card.entity';

interface RawCollection {
    mastered_card_count: number;
    learned_card_count?: number;
}
@Injectable()
export class CollectionsService {
    constructor(
        @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
        @InjectRepository(UserCardProgress) private readonly userCardProgressRepo: Repository<UserCardProgress>,
        @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
        @InjectRepository(UserCollectionProgress)
        private readonly userCollectionProgressRepo: Repository<UserCollectionProgress>,
    ) {}

    create(createCollectionDto: CreateCollectionDto) {
        return 'This action adds a new collection';
    }

    async findAll(userId?: number) {
        const qb = this.collectionRepo
            .createQueryBuilder('collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards');

        if (userId) {
            qb.addSelect((subQuery) => {
                return subQuery
                    .select('COUNT(uc.id)', 'count')
                    .from('user_collection_progress', 'uc')
                    .where('uc.collection_id = collection.id')
                    .andWhere('uc.user_id = :userId', { userId });
            }, 'is_registered');
        }

        const collections = await qb.getRawAndEntities<{
            is_registered?: number;
        }>();

        // Nếu có userId → map thêm is_registered
        if (userId) {
            return collections.entities.map((collection, index) => ({
                ...collection,
                is_registered: Number(collections.raw[index]['is_registered']) > 0,
            }));
        }

        return collections.entities;
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

    findOne(id: number) {
        return `This action returns a #${id} collection`;
    }

    update(id: number, updateCollectionDto: UpdateCollectionDto) {
        return `This action updates a #${id} collection`;
    }

    remove(id: number) {
        return `This action removes a #${id} collection`;
    }

    async registerCollection(id: number, taskNum: number, userId: number) {
        const collection = await this.collectionRepo.findOne({ where: { id } });
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

        collection.register_count += 1;
        await this.collectionRepo.save(collection);

        await this.userCollectionProgressRepo.save(newProgress);

        return {
            collection: newProgress,
        };
    }

    async getMyOwnCollection(userId: number) {
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
                progressStatus: CollectionStatus.IN_PROGRESS,
            })
            .getRawAndEntities<RawCollection>();

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
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_REGISTED_OR_NOT_IN_PROGRESS);
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

    async updateCardStatus(collectionId: number, cardId: number, userId: number, status: CardStatus) {
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

        return userCardProgress;
    }

    async findCardsOfCollection(collectionId: number) {
        // check collection
        const collection = await this.collectionRepo.find({ where: { id: collectionId } });

        if (!collection) throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);

        const cards = await this.cardRepo.find({ where: { collection: { id: collectionId } } });

        return cards ?? [];
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
