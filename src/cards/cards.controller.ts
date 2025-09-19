import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { User } from 'src/common/decarators/user.decorator';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

    @Post()
    create(@Body() createCardDto: CreateCardDto) {
        return this.cardsService.create(createCardDto);
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

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
        return this.cardsService.update(+id, updateCardDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cardsService.remove(+id);
    }
}
