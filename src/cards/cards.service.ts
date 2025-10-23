import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card, CardType } from './entities/card.entity';
import { Not, Repository } from 'typeorm';
import { Collection } from 'src/collections/entities/collection.entity';
import { ERROR_MESSAGES } from 'src/constants';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { FOLDER_CARD_THUMBNAILS, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';
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

        let finalFileName: string | null = null;
        if (file) {
            finalFileName = file.filename;
        } else if (createCardDto.image_url) {
            const imgName = await this.fetchAndSaveImage(createCardDto.image_url);
            if (imgName) {
                finalFileName = imgName;
            } else {
                throw new BadRequestException(ERROR_MESSAGES.CARD.FETCH_AND_SAVE_IMAGE_ERROR);
            }
        }

        rest['image_url'] = `/${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}/${finalFileName}`;

        const card = this.cardRepo.create({
            ...rest,
            collection,
        });

        const newCard = await this.cardRepo.save(card);

        return newCard;
    }

    async findAll(
        searchValue: string | null | undefined,
        collectionName: string | null | undefined,
        type: CardType | null | undefined,
        page: number,
        limit: number,
    ) {
        console.log({ searchValue, collectionName, type, page, limit });
        const query = this.cardRepo.createQueryBuilder('card').leftJoinAndSelect('card.collection', 'collection');

        // Filter search
        if (searchValue) {
            query.andWhere('(LOWER(card.en_word) LIKE :search OR LOWER(card.vn_word) LIKE :search)', {
                search: `%${searchValue.toLowerCase()}%`,
            });
        }

        // Filter collection
        if (collectionName) {
            query.andWhere('collection.name = :collectionName', { collectionName });
        }

        // Filter type
        if (type) {
            query.andWhere('card.type = :type', { type });
        }

        // Pagination
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        // Sort theo id ASC
        query.orderBy('card.id', 'ASC');

        // Lấy dữ liệu và total count
        const [cards, total] = await query.getManyAndCount();

        // Map thêm collectionId và collectionName
        const mappedCards = cards.map((card) => ({
            ...card,
            collectionId: card.collection.id,
            collectionName: card.collection.name,
        }));

        console.log({ mappedCards });

        return {
            data: mappedCards,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
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

        let finalFileName: string | undefined;

        if (file) {
            finalFileName = file.filename;
        } else if (updateCardDto.image_url) {
            if (updateCardDto.image_url !== card.image_url) {
                const imgName = await this.fetchAndSaveImage(updateCardDto.image_url);
                if (!imgName) {
                    throw new BadRequestException(ERROR_MESSAGES.CARD.FETCH_AND_SAVE_IMAGE_ERROR);
                }
                finalFileName = imgName;
            } else {
                finalFileName = card.image_url?.replace(`/${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}/`, '');
            }
        }

        if (finalFileName) {
            updateCardDto.image_url = `/${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}/${finalFileName}`;
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

    private async fetchAndSaveImage(url: string) {
        try {
            // Tạo thư mục nếu chưa tồn tại
            const uploadPath = './uploads/card_thumbnails';
            const res = await fetch(url);
            if (!res.ok) throw new BadRequestException('Cannot fetch image');

            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const ext = extname(new URL(url).pathname) || '.jpg';
            const finalFileName = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;

            await writeFile(join(uploadPath, finalFileName), buffer);
            return finalFileName;
        } catch {
            return null;
        }
    }
}
