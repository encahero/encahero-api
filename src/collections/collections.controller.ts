import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { User } from 'src/common/decarators/user.decorator';

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
    async getMyCollection(@User('id') userId: number) {
        const data = await this.collectionsService.getMyCollection(userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.GET_OWN, data);
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
    async register(@Param('id') id: string, @Body('taskNum') taskNum: number, @User('id') userId: number) {
        const data = await this.collectionsService.register(+id, +taskNum, userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.COLLECTION.REGISTER, data);
    }
}
