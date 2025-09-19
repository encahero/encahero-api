import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    async findAll() {
        const data = await this.categoriesService.findAll();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_ALL, data);
    }

    @Get(':id/collection')
    async findCollectionOfCategory(@Param('id') id: string) {
        const data = await this.categoriesService.getCollectionOfCategory(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_COLLECTION_OF_CATEGORY, data);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(+id);
    }
}
