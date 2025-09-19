import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { User } from 'src/common/decarators/user.decorator';
import { CollectionStatus } from 'src/progress/entities/user-collection-progress.entity';
import { CardStatus } from 'src/progress/entities/user-card-progress.entity';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    @Post()
    create(@Body() createCollectionDto: CreateCollectionDto) {
        return this.collectionsService.create(createCollectionDto);
    }

    @Get()
    async findAll() {
        const data = await this.collectionsService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.FIND_ALL, data);
    }

    @UseGuards(AuthGuard)
    @Get('my-collection')
    async getMyCollection(@User('id', ParseIntPipe) userId: number) {
        const data = await this.collectionsService.getMyOwnCollection(userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.GET_OWN, data);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.collectionsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCollectionDto: UpdateCollectionDto) {
        return this.collectionsService.update(+id, updateCollectionDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.collectionsService.remove(+id);
    }

    @UseGuards(AuthGuard)
    @Post(':id/registrations')
    async register(
        @Param('id', ParseIntPipe) id: number,
        @Body('taskNum', ParseIntPipe) taskNum: number,
        @User('id', ParseIntPipe) userId: number,
    ) {
        const data = await this.collectionsService.registerCollection(+id, +taskNum, userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.REGISTER, data);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/status')
    async changeStatus(
        @Param('id', ParseIntPipe) id: number,
        @User('id', ParseIntPipe) userId: number,
        @Body('status', ParseIntPipe) status: CollectionStatus,
    ) {
        const data = await this.collectionsService.updateStatusOfUserCollection(+id, userId, status);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.CHANGE_STATUS, data);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/task_count')
    async changeTaskCount(
        @Param('id', ParseIntPipe) id: number,
        @User('id', ParseIntPipe) userId: number,
        @Body('task_count', ParseIntPipe) taskCount: number,
    ) {
        const data = await this.collectionsService.updateTaskCountOfUserCollection(+id, userId, taskCount);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.CHANGE_TASK, data);
    }

    // Card of collection

    @UseGuards(AuthGuard)
    @Patch(':collectionId/cards/:cardId/status')
    async changeCardStatus(
        @Param('collectionId', ParseIntPipe) collectionId: number,
        @Param('cardId', ParseIntPipe) cardId: number,
        @User('id', ParseIntPipe) userId: number,
        @Body('status') status: CardStatus,
    ) {
        const data = await this.collectionsService.updateCardStatus(collectionId, cardId, userId, status);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.CHANGE_STATUS, data);
    }

    @Get(':collectionId/cards')
    async findCardsOfCollection(@Param('collectionId', ParseIntPipe) collectionId: number) {
        const data = await this.collectionsService.findCardsOfCollection(collectionId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.FIND_ALL_CARD_OF_COLLECTION, data);
    }

    @UseGuards(AuthGuard)
    @Get(':collectionId/cards/mastered')
    async findMasteredCardsOfCollection(
        @Param('collectionId', ParseIntPipe) collectionId: number,
        @User('id') userId: number,
    ) {
        const data = await this.collectionsService.findMasteredCardsOfCollection(collectionId, userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.FIND_ALL_CARD_OF_COLLECTION, data);
    }
}
