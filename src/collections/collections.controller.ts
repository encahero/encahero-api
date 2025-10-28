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
import { OptionalAuthGuard } from 'src/common/guard/option-auth.guard';
import { Role } from 'src/shared/enums';
import { Roles } from 'src/common/decarators/role.decorator';
import { RolesGuard } from 'src/common/guard/roles.guard';

@Controller('collections')
export class CollectionsController {
    constructor(private readonly collectionsService: CollectionsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    async create(@Body() createCollectionDto: CreateCollectionDto) {
        const data = await this.collectionsService.create(createCollectionDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.CREATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateCollectionDto: UpdateCollectionDto) {
        const data = await this.collectionsService.update(+id, updateCollectionDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.UPDATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const data = await this.collectionsService.remove(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.REMOVE, data);
    }

    @UseGuards(OptionalAuthGuard)
    @Get()
    async findAll(@User('id') userId: number, @User('role') role: Role) {
        const data = await this.collectionsService.findAll(userId, role);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.FIND_ALL, data);
    }

    @UseGuards(AuthGuard)
    @Get('my-collection')
    async getMyCollection(@User('id') userId: number, @User('time_zone') timeZone: string) {
        const data = await this.collectionsService.getMyOwnCollection(userId, timeZone);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.GET_OWN, data);
    }

    @UseGuards(AuthGuard)
    @Get('stop')
    async getStopCollection(@User('id') userId: string) {
        const data = await this.collectionsService.getStopCollection(Number(userId));
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.GET_STOP_COLLECTION, data);
    }

    @UseGuards(AuthGuard)
    @Get('completed')
    async getCompletedCollection(@User('id') userId: string) {
        const data = await this.collectionsService.getCompletedCollection(Number(userId));
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.GET_STOP_COLLECTION, data);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @User('id') userId: number) {
        const data = await this.collectionsService.findOne(id, userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.FIND_ONE, data);
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
        @Body('status') status: CollectionStatus,
    ) {
        const data = await this.collectionsService.updateStatusOfUserCollection(+id, userId, status);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.CHANGE_STATUS, data);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/task_count')
    async changeTaskCount(
        @Param('id', ParseIntPipe) id: number,
        @User('id', ParseIntPipe) userId: number,
        @Body('taskNum', ParseIntPipe) taskNum: number,
    ) {
        const data = await this.collectionsService.updateTaskCountOfUserCollection(+id, userId, taskNum);
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
        @User('time_zone') timeZone: string,
    ) {
        const data = await this.collectionsService.updateCardStatus(collectionId, cardId, userId, status, timeZone);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.CHANGE_STATUS, data);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':collectionId/cards')
    async findCardsOfCollection(@Param('collectionId', ParseIntPipe) collectionId: number, @User('id') userId: number) {
        const data = await this.collectionsService.findCardsOfCollection(collectionId, userId);
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
