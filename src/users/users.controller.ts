import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Post('time-zone')
    async updateTimeZone(@User('id') userId: number, @Body('timeZone') timeZone: string) {
        const data = await this.usersService.updateTimeZone(userId, timeZone);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.USER.UPDATE_TIMEZONE, data);
    }

    @Get()
    @UseGuards(AuthGuard)
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
