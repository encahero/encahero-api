import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { OptionalAuthGuard } from 'src/common/guard/option-auth.guard';
import { User } from 'src/common/decarators/user.decorator';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Role } from 'src/shared/enums';
import { Roles } from 'src/common/decarators/role.decorator';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    async create(@Body('name') categoryName: string) {
        const data = await this.categoriesService.create(categoryName);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.CREATE, data);
    }

    @UseGuards(OptionalAuthGuard)
    @Get()
    async findAll(@User('role') role: Role) {
        console.log({ role });
        const data = await this.categoriesService.findAll(role);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_ALL, data);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id/collection')
    async findCollectionOfCategory(@Param('id') id: string, @User('id') userId: number, @User('role') role: Role) {
        const data = await this.categoriesService.getCollectionOfCategory(+id, userId, role);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.FIND_COLLECTION_OF_CATEGORY, data);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.findOne(id);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body('name') categoryName: string, @Body('isPublic') isPublic: boolean) {
        console.log({ isPublic, categoryName });
        const data = await this.categoriesService.update(+id, categoryName, isPublic);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.UPDATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const data = await this.categoriesService.remove(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CATEGORY.REMOVE, data);
    }
}
