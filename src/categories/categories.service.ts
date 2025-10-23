import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
    ) {}

    async create(categoryName: string) {
        const existed = await this.categoryRepo.findOne({ where: { name: categoryName } });
        if (existed) {
            throw new BadRequestException(ERROR_MESSAGES.CATEGORY.EXISTED);
        }

        const category = this.categoryRepo.create({ name: categoryName });
        return this.categoryRepo.save(category);
    }

    async findAll() {
        const categories = await this.categoryRepo
            .createQueryBuilder('category')
            .loadRelationCountAndMap('category.collection_count', 'category.collections')
            .getMany();

        return categories;
    }

    async getCollectionOfCategory(categoryId: number, userId?: number) {
        const qb = this.collectionRepo
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.category', 'category')
            .where('category.id = :categoryId', { categoryId })
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

        const collections = await qb.getRawAndEntities<{ is_registered?: number }>();
        if (userId) {
            return collections.entities.map((collection, index) => ({
                ...collection,
                is_registered: Number(collections.raw[index]['is_registered']) > 0,
            }));
        }
        return collections.entities;
    }

    findOne(id: number) {
        return `This action returns a #${id} category`;
    }

    async update(id: number, categoryName: string) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category) throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);

        // Kiểm tra trùng tên (nếu cần)
        const existed = await this.categoryRepo.findOne({ where: { name: categoryName } });
        if (existed && existed.id !== id) {
            throw new BadRequestException(ERROR_MESSAGES.CATEGORY.EXISTED);
        }

        category.name = categoryName;
        return await this.categoryRepo.save(category);
    }

    async remove(id: number) {
        const category = await this.categoryRepo.findOne({ where: { id }, relations: ['collections'] });
        if (!category) {
            throw new NotFoundException(ERROR_MESSAGES.CATEGORY.NOT_FOUND);
        }

        if (category.collections.length > 0) {
            throw new BadRequestException(ERROR_MESSAGES.CATEGORY.HAVE_COLLECTION_WHEN_DELETE);
        }
        const removedCategory = { ...category };
        await this.categoryRepo.remove(category);

        return removedCategory;
    }
}
