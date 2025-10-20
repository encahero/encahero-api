import { forwardRef, Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Card } from './entities/card.entity';
import { CollectionsModule } from 'src/collections/collections.module';
import { Collection } from 'src/collections/entities/collection.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Card, Collection]), forwardRef(() => CollectionsModule)],
    controllers: [CardsController],
    providers: [CardsService],
})
export class CardsModule {}
