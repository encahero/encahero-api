import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Not, Repository } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { ERROR_MESSAGES } from 'src/constants';

@Injectable()
export class CardsService {
    constructor(
        @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
        @InjectRepository(Collection)
        private collectionRepo: Repository<Collection>,
    ) {}

    async create(file: Express.Multer.File, createCardDto: CreateCardDto) {
        const { collectionId, ...rest } = createCardDto;

        let collection: Collection | null = null;
        if (collectionId) {
            collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
        }

        if (!collection) {
            throw new BadRequestException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
        }

        const existed = await this.cardRepo.findOne({
            where: {
                en_word: createCardDto.en_word,
                vn_word: createCardDto.vn_word,
                collection: { id: collection.id },
            },
        });

        if (existed) {
            throw new BadRequestException(ERROR_MESSAGES.CARD.EXISTED);
        }

        if (file) {
            rest['image_url'] = `/uploads/avatars/${file.filename}`;
        }

        const card = this.cardRepo.create({
            ...rest,
            collection,
        });

        const newCard = await this.cardRepo.save(card);

        return newCard;
    }

    async findAll() {
        const cards = await this.cardRepo.find({
            relations: ['collection'], // load relation
            order: {
                id: 'ASC',
            },
        });

        // map ra collectionId và collectionName
        return cards.map((card) => ({
            ...card,
            collectionId: card.collection.id,
            collectionName: card.collection.name,
        }));
    }

    findOne(id: number) {
        return `This action returns a #${id} card`;
    }

    async update(file: Express.Multer.File, id: number, updateCardDto: UpdateCardDto) {
        const card = await this.cardRepo.findOne({ where: { id } });
        if (!card) {
            throw new BadRequestException(ERROR_MESSAGES.CARD.NOT_FOUND);
        }

        let collection: Collection | null = card.collection;
        if (updateCardDto.collectionId) {
            collection = await this.collectionRepo.findOne({
                where: { id: updateCardDto.collectionId },
            });
            if (!collection) {
                throw new BadRequestException(ERROR_MESSAGES.COLLECTION.NOT_FOUND);
            }
        }

        const existed = await this.cardRepo.findOne({
            where: {
                en_word: updateCardDto.en_word ?? card.en_word,
                vn_word: updateCardDto.vn_word ?? card.vn_word,
                collection: collection ? { id: collection.id } : undefined,
                id: Not(id),
            },
        });

        if (existed) {
            throw new BadRequestException(ERROR_MESSAGES.CARD.EXISTED);
        }

        if (file) {
            updateCardDto['image_url'] = `/uploads/avatars/${file.filename}`;
        }

        Object.assign(card, {
            ...updateCardDto,
            collection,
        });

        const updatedCard = await this.cardRepo.save(card);
        return updatedCard;
    }

    async remove(id: number) {
        const card = await this.cardRepo.findOne({ where: { id } });
        if (!card) {
            throw new BadRequestException(ERROR_MESSAGES.CARD.NOT_FOUND);
        }

        await this.cardRepo.remove(card);

        return true;
    }
}
