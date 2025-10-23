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
    ParseIntPipe,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';

import { FOLDER_CARD_THUMBNAILS, FOLDER_UPLOAD } from 'src/constants/upload-folder-name';
import { Roles } from 'src/common/decarators/role.decorator';
import { Role } from 'src/shared/enums';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { CardType } from './entities/card.entity';
import { ImageMemoryInterceptor } from 'src/common/interceptors/memory-image.interceptor';
import { ImageResizeInterceptor } from 'src/common/interceptors/resize-image.interceptor';

@Controller('cards')
export class CardsController {
    constructor(private readonly cardsService: CardsService) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    // @UseInterceptors(
    //     CustomImageInterceptor({ fieldName: 'image_file', uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}` }),
    //     )
    @UseInterceptors(
        ImageMemoryInterceptor({ fieldName: 'image_file' }),
        new ImageResizeInterceptor({
            uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}`,
            width: 300,
            height: 300,
        }),
    )
    async create(@UploadedFile() file: Express.Multer.File, @Body() createCardDto: CreateCardDto) {
        const data = await this.cardsService.create(file, createCardDto);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.CREATE, data);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    @UseInterceptors(
        ImageMemoryInterceptor({ fieldName: 'image_file' }),
        new ImageResizeInterceptor({
            uploadPath: `./${FOLDER_UPLOAD}/${FOLDER_CARD_THUMBNAILS}`,
            width: 300,
            height: 300,
        }),
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
        @Query('page', ParseIntPipe) page: number = 1,
        @Query('limit', ParseIntPipe) limit: number = 20,
    ) {
        const data = await this.cardsService.findAll(searchValue, collectionName, type, page, limit);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.CARD.FIND_ALL, data);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cardsService.findOne(+id);
    }
}
