import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from 'src/collections/entities/collection.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
    ) {}

    create(createCategoryDto: CreateCategoryDto) {
        return 'This action adds a new category';
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

    update(id: number, updateCategoryDto: UpdateCategoryDto) {
        return `This action updates a #${id} category`;
    }

    remove(id: number) {
        return `This action removes a #${id} category`;
    }
}
