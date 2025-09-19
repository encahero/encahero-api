import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CollectionsModule } from 'src/collections/collections.module';
import { Collection } from 'src/collections/entities/collection.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Collection]), forwardRef(() => CollectionsModule)],
    controllers: [CategoriesController],
    providers: [CategoriesService],
})
export class CategoriesModule {}
