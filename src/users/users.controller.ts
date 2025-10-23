import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

import { FOLDER_AVATAR, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';
import CustomImageInterceptor from 'src/common/interceptors/custom-image.interceptor';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decarators/role.decorator';
import { Role } from 'src/shared/enums';

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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    async findAll(
        @Query('searchValue') searchValue?: string,
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 20,
    ) {
        const data = await this.usersService.findAll(searchValue, page, limit);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.USER.FIND_ALL, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('growth')
    async findUserGrowth() {
        const data = await this.usersService.findUserGrowth();
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.USER.UPDATE_PROFILE, data);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    @UseInterceptors(CustomImageInterceptor({ fieldName: 'avatar', uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_AVATAR}` }))
    async update(
        @Param('id') id: string,
        @User('id') userId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const data = await this.usersService.update(+id, userId, file, updateUserDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.USER.UPDATE_PROFILE, data);
    }
}
