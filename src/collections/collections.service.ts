import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from 'src/constants';
import { CollectionStatus, UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';

@Injectable()
export class CollectionsService {
    constructor(
        @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
        @InjectRepository(UserCollectionProgress)
        private readonly userCollectionProgressRepo: Repository<UserCollectionProgress>,
    ) {}

    create(createCollectionDto: CreateCollectionDto) {
        return 'This action adds a new collection';
    }

    async findAll() {
        const collections = await this.collectionRepo
            .createQueryBuilder('collection')
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .getMany();

        return collections;
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

    async register(id: number, taskNum: number, userId: number) {
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
            status: CollectionStatus.IN_PROGRESS,
        });

        await this.userCollectionProgressRepo.save(newProgress);

        return {
            collection: newProgress,
        };
    }

    async getMyCollection(userId: number) {
        const collections = await this.userCollectionProgressRepo
            .createQueryBuilder('progress')
            .leftJoinAndSelect('progress.collection', 'collection')
            .where('progress.user_id = :userId', { userId })
            .select(['progress', 'collection.id', 'collection.name'])
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .getMany();

        return collections;
    }

    async stopCollection(id: number, userId: number) {
        const progress = await this.userCollectionProgressRepo.findOne({
            where: { user_id: userId, collection_id: id, status: CollectionStatus.IN_PROGRESS },
        });

        if (!progress) {
            throw new NotFoundException(ERROR_MESSAGES.COLLECTION.NOT_REGISTED_OR_NOT_IN_PROGRESS);
        }

        progress.status = CollectionStatus.STOPPED;
        progress.stopped_at = new Date();

        await this.userCollectionProgressRepo.save(progress);

        return {
            collectionId: id,
            status: progress.status,
            stopedAt: progress.started_at,
        };
    }

    async changeTaskCount(id: number, userId: number, taskCount: number) {
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
            taskCount: progress.task_count,
            stopedAt: progress.started_at,
        };
    }
}
