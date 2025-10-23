import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

import CustomImageInterceptor from 'src/common/interceptors/custom-image.interceptor';
import { FOLDER_CARD_THUMBNAILS, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';
import { Roles } from 'src/common/decarators/role.decorator';
import { Role } from 'src/shared/enums';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CardType } from './entities/card.entity';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    @UseInterceptors(
        CustomImageInterceptor({ fieldName: 'image_file', uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}` }),
    )
    async create(@UploadedFile() file: Express.Multer.File, @Body() createCardDto: CreateCardDto) {
        const data = await this.cardsService.create(file, createCardDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.CREATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    @UseInterceptors(
        CustomImageInterceptor({ fieldName: 'image_file', uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}` }),
    )
    async update(
        @UploadedFile() file: Express.Multer.File,
        @Param('id') id: string,
        @Body() updateCardDto: UpdateCardDto,
    ) {
        const data = await this.cardsService.update(file, +id, updateCardDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.UPDATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const data = await this.cardsService.remove(+id);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.REMOVE, data);
    }

    @Get()
    async findAll(
        @Query('searchValue') searchValue?: string,
        @Query('collectionName') collectionName?: string,
        @Query('type') type?: CardType,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        const data = await this.cardsService.findAll(searchValue, collectionName, type, page, limit);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.FIND_ALL, data);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cardsService.findOne(+id);
    }
}
