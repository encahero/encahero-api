import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor('image_file', {
            storage: diskStorage({
                destination: './uploads/card_thumbnails',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.random().toString(36).slice(2);
                    cb(null, `${unique}-${file.originalname}`);
                },
            }),
        }),
    )
    async create(@UploadedFile() file: Express.Multer.File, @Body() createCardDto: CreateCardDto) {
        const data = await this.cardsService.create(file, createCardDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.CREATE, data);
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('image_file', {
            storage: diskStorage({
                destination: './uploads/card_thumbnails',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.random().toString(36).slice(2);
                    cb(null, `${unique}-${file.originalname}`);
                },
            }),
        }),
    )
    async update(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Body() updateCardDto: UpdateCardDto,
    ) {
        const data = await this.cardsService.update(file, +id, updateCardDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.UPDATE, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const data = await this.cardsService.remove(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.REMOVE, data);
    }

    @Get()
    async findAll() {
        const data = await this.cardsService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.FIND_ALL, data);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cardsService.findOne(+id);
    }
}
