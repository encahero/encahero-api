import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import type AuthenticatedRequest from 'src/shared/interfaces/auth-request';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.collectionsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
        return this.collectionsService.update(+id, updateCollectionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.collectionsService.remove(+id);
    }

    @UseGuards(AuthGuard)
    @Post('register/:id')
    register(@Param('id') id: string, @Body('taskNum') taskNum: number, @Req() req: AuthenticatedRequest) {
        const userId = req.user!.userId;
        return this.collectionsService.register(+id, +taskNum, userId);
    }
}
