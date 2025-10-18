import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { OptionalAuthGuard } from 'src/common/guard/option-auth.guard';
import { User } from 'src/common/decarators/user.decorator';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    async create(@Body('name') categoryName: string) {
        const data = await this.categoriesService.create(categoryName);

        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.CREATE, data);
    }

    @Get()
    async findAll() {
        const data = await this.categoriesService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_ALL, data);
    }
    @UseGuards(OptionalAuthGuard)
    @Get(':id/collection')
    async findCollectionOfCategory(@Param('id') id: string, @User('id') userId: number) {
        const data = await this.categoriesService.getCollectionOfCategory(+id, userId);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_COLLECTION_OF_CATEGORY, data);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body('name') categoryName: string) {
        const data = await this.categoriesService.update(+id, categoryName);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.UPDATE, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const data = await this.categoriesService.remove(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.REMOVE, data);
    }
}
