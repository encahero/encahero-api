import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CollectionsService {
    constructor(@InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>) {}

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
}
