import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection } from './entities/collection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserCollectionProgress } from 'src/progress/entities/user-collection-progress.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Collection, UserCollectionProgress, User])],
    controllers: [CollectionsController],
    providers: [CollectionsService],
})
export class CollectionsModule {}
