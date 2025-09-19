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

    async getCollectionOfCategory(id: number) {
        const collections = await this.collectionRepo
            .createQueryBuilder('collection')
            .leftJoinAndSelect('collection.category', 'category')
            .where('category.id = :id', { id })
            .loadRelationCountAndMap('collection.card_count', 'collection.cards')
            .getMany();

        return collections;
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
