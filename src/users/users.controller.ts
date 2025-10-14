import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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

    @UseGuards(AuthGuard)
    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/avatars',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.random().toString(36).slice(2);
                    cb(null, unique + '-' + file.originalname);
                },
            }),
        }),
    )
    async update(
        @Param('id') id: string,
        @User('id') userId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const data = await this.usersService.update(+id, userId, file, updateUserDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.USER.UPDATE_PROFILE, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
