import {
    Controller,
    HttpStatus,
    Param,
    UseGuards,
    Query,
    ParseIntPipe,
    Get,
    DefaultValuePipe,
    Post,
    Body,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { successResponse } from 'src/common/response';
import { SUCCESS_MESSAGES } from 'src/constants';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { User } from 'src/common/decarators/user.decorator';
import { AnswerDto } from './dto/answer.dto';
import type { RandomQuizMode } from 'src/shared/types';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @UseGuards(AuthGuard)
    @Get('/:collectionId')
    async randomQuizFromCollection(
        @Param('collectionId', ParseIntPipe) collectionId: number,
        @User('id', ParseIntPipe) userId: number,
        @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit = 5,
        @Query('mode', new DefaultValuePipe('old')) mode: RandomQuizMode,
    ) {
        const data = await this.quizService.randomQuizFromCollection(collectionId, userId, mode, limit);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.QUIZ.RAMDOM_FROM_COLLECTION, data);
    }

    @UseGuards(AuthGuard)
    @Post('/:collectionId/answer/:cardId')
    async answerQuiz(
        @Param('collectionId', ParseIntPipe) collectionId: number,
        @Param('cardId', ParseIntPipe) cardId: number,
        @User('id', ParseIntPipe) userId: number,
        @Body() answer: AnswerDto,
    ) {
        const data = await this.quizService.answerQuiz(collectionId, cardId, userId, answer);
        return successResponse(HttpStatus.OK, SUCCESS_MESSAGES.QUIZ.ANSWER, data);
    }
}
